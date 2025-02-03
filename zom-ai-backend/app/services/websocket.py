from fastapi import WebSocket
import asyncio
import aiohttp
import json
from typing import Dict, List
import os

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.polygon_key = os.getenv("POLYGON_API_KEY")
        self.websocket_url = "wss://socket.polygon.io/stocks"
        self.running = False
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
    async def broadcast(self, message: Dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        for connection in disconnected:
            await self.disconnect(connection)
                
    async def start_streaming(self, symbols: List[str]):
        if self.running:
            return
            
        self.running = True
        async with aiohttp.ClientSession() as session:
            async with session.ws_connect(f"{self.websocket_url}") as ws:
                await ws.send_str(json.dumps({
                    "action": "auth",
                    "params": self.polygon_key
                }))
                
                await ws.send_str(json.dumps({
                    "action": "subscribe",
                    "params": [f"T.{symbol}" for symbol in symbols]
                }))
                
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        data = json.loads(msg.data)
                        if isinstance(data, list) and data:
                            trade = data[0]
                            if trade.get('ev') == 'T':
                                await self.broadcast({
                                    "symbol": trade.get('sym'),
                                    "price": str(trade.get('p')),
                                    "size": str(trade.get('s')),
                                    "timestamp": trade.get('t')
                                })
                    elif msg.type == aiohttp.WSMsgType.ERROR:
                        break
        
        self.running = False

manager = WebSocketManager()
