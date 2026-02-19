from typing import Optional
from pydantic import BaseModel
from pydantic.types import UUID
from datetime import datetime


class DepartmentStaffCreate(BaseModel):
    user_id: UUID
    department_id: UUID


class DepartmentStaffOut(BaseModel):
    id: UUID
    user_id: UUID
    department_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentStaffUpdate(BaseModel):
    department_id: Optional[UUID] = None
