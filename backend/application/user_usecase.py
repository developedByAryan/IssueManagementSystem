from domain.entities.user import User
from domain.repositories.user_repo import UserRepository
class UserUseCase:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def create_user(self, name: str, email: str) -> User:
        if self.user_repo.get_by_email(email):
            raise ValueError("Email already exists")
        user = User(name=name, email=email)
        return self.user_repo.save(user)

    def get_user(self, user_id: int) -> User | None:
        return self.user_repo.get_by_id(user_id)
