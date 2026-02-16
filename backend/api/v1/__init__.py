from fastapi import APIRouter
from api.v1.routes.user import router as user_router
from api.v1.routes.issue import router as issue_router
from api.v1.routes.department import router as department_router
from api.v1.routes.auth import router as auth_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(user_router)
api_router.include_router(issue_router)
api_router.include_router(department_router)
api_router.include_router(auth_router)
