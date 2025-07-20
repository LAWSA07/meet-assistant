from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
from dotenv import load_dotenv

from database import get_user_by_email, get_user_by_github_id, get_user_by_google_id, create_user, update_user
from models import TokenData, UserResponse

load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is required")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """Verify and decode JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    return token_data

async def get_current_user(token_data: TokenData = Depends(verify_token)) -> UserResponse:
    """Get current user from token"""
    user = await get_user_by_email(email=token_data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        created_at=user["created_at"],
        updated_at=user["updated_at"],
        is_active=user["is_active"],
        github_id=user.get("github_id"),
        google_id=user.get("google_id")
    )

async def authenticate_user(email: str, password: str):
    """Authenticate user with email and password"""
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

async def authenticate_github(code: str):
    """Authenticate user with GitHub OAuth"""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code
            },
            headers={"Accept": "application/json"}
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get GitHub token")
        
        token_data = token_response.json()
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data["error_description"])
        
        access_token = token_data["access_token"]
        
        # Get user info from GitHub
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get GitHub user info")
        
        github_user = user_response.json()
        
        # Get user email from GitHub
        emails_response = await client.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"token {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        
        if emails_response.status_code == 200:
            emails = emails_response.json()
            primary_email = next((email["email"] for email in emails if email["primary"]), None)
        else:
            primary_email = github_user.get("email")
        
        if not primary_email:
            raise HTTPException(status_code=400, detail="No email found in GitHub account")
        
        # Check if user exists
        user = await get_user_by_github_id(str(github_user["id"]))
        if not user:
            # Check if user exists with email
            user = await get_user_by_email(primary_email)
            if user:
                # Link GitHub account to existing user
                await update_user(str(user["_id"]), {"github_id": str(github_user["id"])})
            else:
                # Create new user
                user_data = {
                    "email": primary_email,
                    "full_name": github_user["name"] or github_user["login"],
                    "github_id": str(github_user["id"]),
                    "password": get_password_hash("github_oauth_user"),  # Dummy password
                    "role": "free",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "is_active": True
                }
                user_id = await create_user(user_data)
                user = await get_user_by_id(user_id)
        
        return user

async def authenticate_google(token: str):
    """Authenticate user with Google OAuth"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Verify Google token
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        
        google_user = response.json()
        
        # Check if user exists
        user = await get_user_by_google_id(google_user["sub"])
        if not user:
            # Check if user exists with email
            user = await get_user_by_email(google_user["email"])
            if user:
                # Link Google account to existing user
                await update_user(str(user["_id"]), {"google_id": google_user["sub"]})
            else:
                # Create new user
                user_data = {
                    "email": google_user["email"],
                    "full_name": google_user["name"],
                    "google_id": google_user["sub"],
                    "password": get_password_hash("google_oauth_user"),  # Dummy password
                    "role": "free",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "is_active": True
                }
                user_id = await create_user(user_data)
                user = await get_user_by_id(user_id)
        
        return user 