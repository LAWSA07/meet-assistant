from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.FREE

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    github_id: Optional[str] = None
    google_id: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class GitHubAuth(BaseModel):
    code: str

class GoogleAuth(BaseModel):
    token: str

class MeetingSession(BaseModel):
    id: str
    user_id: str
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    summary: Optional[str] = None
    transcript_chunks: List[str] = []
    created_at: datetime

class MeetingSessionCreate(BaseModel):
    title: str

class MeetingSessionResponse(MeetingSession):
    class Config:
        from_attributes = True 