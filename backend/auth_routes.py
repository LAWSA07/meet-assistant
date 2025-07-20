from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from datetime import timedelta, datetime
from typing import Optional

from models import UserCreate, UserLogin, Token, UserResponse, GitHubAuth, GoogleAuth
from auth import (
    authenticate_user, authenticate_github, authenticate_google,
    create_access_token, get_password_hash, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import get_user_by_email, create_user, get_user_by_id

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["created_at"] = user_dict["updated_at"] = datetime.utcnow()
    user_dict["is_active"] = True
    
    user_id = await create_user(user_dict)
    user = await get_user_by_id(user_id)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
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
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login with email and password"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
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
    )

@router.post("/github", response_model=Token)
async def github_auth(auth_data: GitHubAuth):
    """Authenticate with GitHub OAuth"""
    user = await authenticate_github(auth_data.code)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
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
    )

@router.post("/google", response_model=Token)
async def google_auth(auth_data: GoogleAuth):
    """Authenticate with Google OAuth"""
    user = await authenticate_google(auth_data.token)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
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
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.get("/github-url")
async def get_github_auth_url():
    """Get GitHub OAuth URL"""
    from .auth import GITHUB_CLIENT_ID
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
    
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=user:email"
    } 