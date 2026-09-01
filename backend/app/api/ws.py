from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_log(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    Real-time WebSocket endpoint for streaming live logs, metrics, 
    and AI agent reasoning to the frontend dashboard.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from client (if any)
            data = await websocket.receive_text()
            await manager.broadcast_log(f"Client says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
