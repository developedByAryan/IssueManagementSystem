from fastapi.security import OAuth2PasswordRequestForm
from schemas.user import UserCreate, UserLogin, UserOut, TokenOut
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from infrastructure.repositories.user_repo_impl import SqlAlchemyUserRepository
from application.user_usecase import UserUsecase
from domain.entities.user import User
from core.security import decode_refresh_token, create_access_token



router = APIRouter(prefix="/auth", tags=["auth"])   

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_create: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (public endpoint)."""
    repo = SqlAlchemyUserRepository(db)
    user_use_case = UserUsecase(repo)
    try:
        user = user_use_case.register(
            email=user_create.email,
            password=user_create.password,
            full_name=user_create.full_name
        )
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenOut)
def login(user_login: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token (public endpoint)."""
    repo = SqlAlchemyUserRepository(db)
    user_use_case = UserUsecase(repo)
    try:
        token = user_use_case.login(email=user_login.username, password=user_login.password)
        return TokenOut(access_token=token.access_token, refresh_token=token.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    

@router.post("/refresh")
async def refresh_token(token:str) :
    """Refresh access token using a valid refresh token."""
    payload = decode_refresh_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    new_access_token = create_access_token(data={"sub": payload.get("sub"), "uid": payload.get("uid")})
    
    return{
        "access_token":new_access_token,
        "token_type":"bearer"
    }