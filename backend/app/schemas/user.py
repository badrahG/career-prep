from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    student_code: Optional[str] = None

    class Config:
        from_attributes = True


class UserAdminResponse(BaseModel):
    """Extra fields for admin view of users"""
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool = False
    created_at: datetime
    cv_count: int = 0
    custom_ai_limit: Optional[int] = None
    custom_tr_limit: Optional[int] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class UserUpdateAdmin(BaseModel):
    """Admin can update role and active status"""
    role: Optional[str] = None
    is_active: Optional[bool] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    student_code: Optional[str] = None