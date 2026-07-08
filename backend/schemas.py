"""
schemas.py

Ye file data ka format define karti hai jo Frontend (React) se aata hai ya usko bheja jata hai.
Pydantic ensure karta hai ki koi galat data database mein save na ho jaye.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# Users
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class ProfileResponse(UserResponse):
    post_count: int = 0
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False

# Comments
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: int

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    author: UserResponse

    class Config:
        from_attributes = True

class PostAuthorResponse(UserResponse):
    is_following: bool = False

# Posts
class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    created_at: datetime
    user_id: int
    author: PostAuthorResponse
    # We won't nest comments here to keep it lightweight, fetch them separately
    
    class Config:
        from_attributes = True

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
