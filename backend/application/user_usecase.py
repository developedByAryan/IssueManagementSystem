from datetime import datetime, timedelta, timezone
from jose import jwt
from core.config import settings
from domain.services.user_service import UserService
from domain.repositories.user_repo import UserRepository

class UserUsecase:
    def __init__(self, repo: UserRepository):
        self.repo = repo
        self.user_service = UserService()

    def register(self, email: str, password: str, username: str, full_name: str):
        existing = self.repo.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")

        hashed = self.user_service.hash_password(password)
        user = self.repo.create(
            email=email,
            hashed_password=hashed,
            username=username,
            full_name=full_name,
            role="USER"
        )
        return user

    def login(self, email: str, password: str) -> str:
        user = self.repo.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")

        if not self.user_service.verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        return self.create_access_token({"sub": user.email, "uid": user.id})

    def create_access_token(self, data: dict) -> str:
        payload = data.copy()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload["exp"] = expires_at
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
