from pydantic import BaseModel, Field
from pydantic.types import UUID4
from datetime import datetime
from typing import Optional


class IssueCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    department_id: UUID4
    priority: str = Field(default="LOW")
    assigned_to: Optional[UUID4] = None


class IssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[UUID4] = None


class IssueOut(BaseModel):
    id: UUID4
    title: str
    description: str
    status: str
    priority: str
    department_id: UUID4
    reported_by: UUID4
    assigned_to: Optional[UUID4] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class IssueCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


class IssueCommentOut(BaseModel):
    id: UUID4
    content: str
    issue_id: UUID4
    user_id: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None


class DepartmentOut(BaseModel):
    id: UUID4
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
