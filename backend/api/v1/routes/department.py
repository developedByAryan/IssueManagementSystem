from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db, get_current_user, require_admin
from domain.entities.user import User
from schemas.issue import DepartmentCreate, DepartmentUpdate, DepartmentOut
from infrastructure.repositories.department_repo_impl import SqlAlchemyDepartmentRepository

router = APIRouter(prefix="/departments", tags=["departments"])


@router.post("/", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new department (admin only)."""
    repo = SqlAlchemyDepartmentRepository(db)
    
    # Check if department name already exists
    existing = repo.get_by_name(department_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Department name already exists")
    
    department = repo.create(
        name=department_data.name,
        description=department_data.description
    )
    return department


@router.get("/", response_model=List[DepartmentOut])
def get_all_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all departments (authenticated users)."""
    repo = SqlAlchemyDepartmentRepository(db)
    departments = repo.get_all()
    return departments


@router.get("/{department_id}", response_model=DepartmentOut)
def get_department(
    department_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get department by ID."""
    repo = SqlAlchemyDepartmentRepository(db)
    department = repo.get_by_id(department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/{department_id}", response_model=DepartmentOut)
def update_department(
    department_id: str,
    department_data: DepartmentUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a department (admin only)."""
    repo = SqlAlchemyDepartmentRepository(db)
    
    # Check if new name already exists (if name is being updated)
    if department_data.name:
        existing = repo.get_by_name(department_data.name)
        if existing and str(existing.id) != department_id:
            raise HTTPException(status_code=400, detail="Department name already exists")
    
    update_data = department_data.model_dump(exclude_unset=True)
    department = repo.update(department_id, **update_data)
    
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a department (admin only)."""
    repo = SqlAlchemyDepartmentRepository(db)
    success = repo.delete(department_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")
    return None
