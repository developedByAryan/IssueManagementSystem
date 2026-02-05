from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    def hash_password(self, password: str) -> str:
        return _pwd.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return _pwd.verify(plain_password, hashed_password)
