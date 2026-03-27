import json
from typing import List
from collections import defaultdict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: dict[str, List[WebSocket]] = defaultdict(list)
        self.department_connections: dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, user_id: str = None, department_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_connections[user_id].append(websocket)
            print(f"Registered connection for user: {user_id}")
        if department_id:
            self.department_connections[department_id].append(websocket)
            print(f"Registered connection for department: {department_id}")

    def disconnect(self, websocket: WebSocket, user_id: str = None, department_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and websocket in self.user_connections.get(user_id, []):
            try:
                self.user_connections[user_id].remove(websocket)
            except ValueError:
                pass
        if department_id and websocket in self.department_connections.get(department_id, []):
            try:
                self.department_connections[department_id].remove(websocket)
            except ValueError:
                pass

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except:
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

    async def send_to_user(self, user_id: str, message: dict):
        connections = self.user_connections.get(user_id, [])
        print(f"Sending message to user {user_id} ({len(connections)} connections)")
        for connection in list(connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending to user {user_id}: {e}")
                if connection in self.user_connections[user_id]:
                    self.user_connections[user_id].remove(connection)
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

    async def send_to_department(self, department_id: str, message: dict):
        connections = self.department_connections.get(department_id, [])
        print(f"Sending message to department {department_id} ({len(connections)} connections)")
        for connection in list(connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending to department {department_id}: {e}")
                if connection in self.department_connections[department_id]:
                    self.department_connections[department_id].remove(connection)
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

manager = ConnectionManager()
