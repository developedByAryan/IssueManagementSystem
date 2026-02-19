from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database.deps import create_tables
from contextlib import asynccontextmanager
from api.v1 import api_router
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(lifespan=lifespan, docs_url="/api-test", title="IMS API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(api_router)


@app.get("/")

def health():
    return{"message":"API is healthy"}

