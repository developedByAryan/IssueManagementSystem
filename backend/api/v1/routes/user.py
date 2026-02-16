from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db, get_current_user, require_admin
from domain.entities.user import User
from schemas.user import UserOut, UserRoleUpdate
from infrastructure.repositories.user_repo_impl import SqlAlchemyUserRepository
from application.user_usecase import UserUsecase

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information (protected endpoint)."""
    return current_user


@router.get("/", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    repo = SqlAlchemyUserRepository(db)
    users = repo.get_all()
    return users


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)."""
    repo = SqlAlchemyUserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user role (admin/superadmin only)."""
    repo = SqlAlchemyUserRepository(db)
    user_use_case = UserUsecase(repo)
    print(user_id, role_update.role, current_user.id, current_user.role)
    try:
        user = user_use_case.update_user_role(
            user_id, 
            role_update.role, 
            current_user.id, 
            current_user.role,
            role_update.department_id
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)."""
    repo = SqlAlchemyUserRepository(db)
    success = repo.delete(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None

