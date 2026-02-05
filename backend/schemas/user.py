from pydantic import BaseModel, EmailStr
from pydantic.types import UUID
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str
    full_name:str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
