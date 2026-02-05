from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from domain.entities.user import User, UserRole

class UserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def create(self, username: str, email: str, hashed_password: str, full_name: str, role: UserRole = UserRole.USER) -> User:
        raise NotImplementedError

    @abstractmethod
    def get_all(self) -> list[User]:
        raise NotImplementedError

    @abstractmethod
    def update(self, user_id: UUID, **kwargs) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, user_id: UUID) -> bool:
        raise NotImplementedError
