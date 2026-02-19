from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db, require_admin
from schemas.department_staff import DepartmentStaffOut
from infrastructure.repositories.department_staff_repo_impl import SqlAlchemyDepartmentStaffRepository

router = APIRouter(prefix="/department-staff", tags=["department-staff"])


@router.get("/", response_model=List[DepartmentStaffOut])
def get_all_department_staff(
    db: Session = Depends(get_db)
):
    """Get all department staff assignments."""
    repo = SqlAlchemyDepartmentStaffRepository(db)
    staff = repo.get_all()
    return staff


@router.get("/{staff_id}", response_model=DepartmentStaffOut)
def get_department_staff(
    staff_id: str,
    db: Session = Depends(get_db)
):
    """Get department staff by ID."""
    from uuid import UUID
    try:
        staff_uuid = UUID(staff_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid staff ID format")
    
    repo = SqlAlchemyDepartmentStaffRepository(db)
    staff = repo.get_by_id(staff_uuid)
    if not staff:
        raise HTTPException(status_code=404, detail="Department staff not found")
    return staff


@router.get("/user/{user_id}", response_model=List[DepartmentStaffOut])
def get_staff_by_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get all department assignments for a user."""
    from uuid import UUID
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    repo = SqlAlchemyDepartmentStaffRepository(db)
    staff = repo.get_by_user_id(user_uuid)
    return staff


@router.get("/department/{department_id}", response_model=List[DepartmentStaffOut])
def get_staff_by_department(
    department_id: str,
    db: Session = Depends(get_db)
):
    """Get all staff members assigned to a department."""
    from uuid import UUID
    try:
        dept_uuid = UUID(department_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid department ID format")
    
    repo = SqlAlchemyDepartmentStaffRepository(db)
    staff = repo.get_by_department_id(dept_uuid)
    return staff
