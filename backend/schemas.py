from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, SentimentEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum
    manager_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class FeedbackBase(BaseModel):
    strengths: str
    areas_to_improve: str
    sentiment: SentimentEnum
    tags: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    employee_id: int

class FeedbackOut(FeedbackBase):
    id: int
    manager_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime
    acknowledged: bool
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[RoleEnum] = None

class FeedbackRequestBase(BaseModel):
    message: Optional[str] = None
    tags: Optional[str] = None

class FeedbackRequestCreate(FeedbackRequestBase):
    pass

class FeedbackRequestOut(FeedbackRequestBase):
    id: int
    employee_id: int
    manager_id: int
    created_at: datetime
    fulfilled: bool
    class Config:
        orm_mode = True

class FeedbackCommentBase(BaseModel):
    comment: str

class FeedbackCommentCreate(FeedbackCommentBase):
    pass

class FeedbackCommentOut(FeedbackCommentBase):
    id: int
    feedback_id: int
    user_id: int
    created_at: datetime
    class Config:
        orm_mode = True 