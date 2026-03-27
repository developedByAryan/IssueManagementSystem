from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database.deps import create_tables
from contextlib import asynccontextmanager
from api.v1 import api_router
from core.config import settings
import json
from typing import List
from datetime import datetime
import asyncio


from core.websocket import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(lifespan=lifespan, docs_url="/api-test", title="IMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.20.1:3000"  
    ],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

app.include_router(api_router)


@app.get("/health")
def health():
    return{"message":"API is healthy"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = None, department_id: str = None):
    await manager.connect(websocket, user_id, department_id)
    print(f"WebSocket connected for user {user_id}. Total: {len(manager.active_connections)}")
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received: {data}")
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for user {user_id}")
        manager.disconnect(websocket, user_id, department_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id, department_id)


async def broadcast_update(message_type: str, data: dict):
    await manager.broadcast({
        "type": message_type,
        "data": data,
        "timestamp": str(datetime.now())
    })
