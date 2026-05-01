from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Signup ke liye data model
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "Member"

# Login ke liye data model
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# User ki detail bahar bhejne ke liye
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

# Project banane wala model
class ProjectCreate(BaseModel):
    name: str
    description: str

# Project ki detail dikhane ke liye
class ProjectOut(BaseModel):
    id: int
    name: str
    description: str
    owner_id: int

    class Config:
        from_attributes = True

# Comment logic
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentOut(CommentBase):
    id: int
    task_id: int
    user_id: int
    timestamp: datetime
    author_name: str = "User"

    class Config:
        from_attributes = True

# Task banane wala model
class TaskCreate(BaseModel):
    title: str
    description: str
    project_id: int
    assigned_to: int

# Task ki poori detail (comments ke sath)
class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    admin_status: str
    project_id: int
    assigned_to: int
    owner_name: str = "Admin"
    assigned_name: str = "Member"
    project_name: str = "Project"
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True

# Status update karne ke liye model
class TaskStatusUpdate(BaseModel):
    status: Optional[str] = None
    admin_status: Optional[str] = None
