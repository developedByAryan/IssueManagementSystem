from fastapi import FastAPI
from infrastructure.database.deps import create_tables
from contextlib import asynccontextmanager
from api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(lifespan=lifespan, docs_url="/api-test", title="IMS API", version="1.0.0")
app.include_router(api_router)


@app.get("/")

def health():
    return{"message":"API is healthy"}

