from uuid import UUID
from core.security import get_password_hash, verify_password, create_refresh_token,create_access_token
from domain.repositories.user_repo import UserRepository
from domain.entities.user import UserRole
from schemas.user import TokenOut


class UserUsecase:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, email: str, password: str, full_name: str):
        # Check if email already exists
        existing = self.repo.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")
        

        # Hash password and create user
        hashed = get_password_hash(password)
        user = self.repo.create(
            email=email,
            hashed_password=hashed,
            full_name=full_name,
            role=UserRole.USER
        )
        return user

    def login(self, email: str, password: str) -> TokenOut:
        user = self.repo.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("User account is inactive")

        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        # Create access token with user email and id
        access_token = create_access_token(
            data={"sub": user.email, "uid": str(user.id)}
        )
        refresh_token = create_refresh_token(
            data={"sub": user.email, "uid": str(user.id)}
        )
        return TokenOut(access_token=access_token, refresh_token=refresh_token)

    def update_user_role(self, user_id: str, role_str: str, current_user_id: UUID, current_user_role: UserRole, department_id: UUID | None = None):
        """Update user role (admin/superadmin only)."""
        # Validate role
        try:
            role = UserRole[role_str.upper()]
        except KeyError:
            raise ValueError(f"Invalid role: {role_str}. Must be one of: USER, DEPARTMENT_STAFF, ADMIN, SUPERADMIN")
        
        # SUPERADMIN role cannot be assigned via API - must be set via SQL or initial setup
        if role == UserRole.SUPERADMIN:
            raise ValueError("SUPERADMIN role cannot be assigned via API. Contact system administrator.")
        
        # Validate department_id for DEPARTMENT_STAFF
        # if role == UserRole.DEPARTMENT_STAFF and not department_id:
        #     raise ValueError("Department assignment is required for DEPARTMENT_STAFF role")
        
        # Convert string to UUID
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            raise ValueError("Invalid user ID format")
        
        # Get target user
        user = self.repo.get_by_id(user_uuid)
        if not user:
            raise ValueError("User not found")
        
        # Prevent users from changing their own role
        if user_uuid == current_user_id:
            raise ValueError("You cannot change your own role")
        
        # Only ADMIN and SUPERADMIN can modify user roles
        if current_user_role not in [UserRole.ADMIN, UserRole.SUPERADMIN]:
            raise ValueError("Only admin or superadmin can modify user roles")
        
        # Only superadmin can modify admin or superadmin users
        # if user.role in [UserRole.ADMIN, UserRole.SUPERADMIN] and current_user_role != UserRole.SUPERADMIN:
        #     raise ValueError("Only superadmin can modify admin or superadmin users")
        
        # Update role and department
        update_data = {"role": role}
        if role == UserRole.DEPARTMENT_STAFF:
            update_data["department_id"] = department_id
        elif department_id is None:
            # Clear department_id if role is not DEPARTMENT_STAFF
            update_data["department_id"] = None
        
        updated_user = self.repo.update(user_uuid, **update_data)
        return updated_user
