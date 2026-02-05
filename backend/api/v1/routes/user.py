from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.deps import get_db
from schemas.user import UserCreate, UserLogin, UserOut, TokenOut
from infrastructure.repositories.user_repo_impl import SqlAlchemyUserRepository
from application.user_usecase import UserUsecase

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_create: UserCreate, db: Session = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    user_use_case = UserUsecase(repo)
    try:
        user = user_use_case.register(
            email=user_create.email,
            password=user_create.password,
            username=user_create.username,
            full_name=user_create.full_name
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenOut)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    repo = SqlAlchemyUserRepository(db)
    user_use_case = UserUsecase(repo)
    try:
        token = user_use_case.login(email=user_login.email, password=user_login.password)
        return TokenOut(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
