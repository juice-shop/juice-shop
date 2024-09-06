import logging
import json
import asyncio
import websockets

logger = logging.getLogger(__name__)

connected_clients = set()

async def register(websocket):
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)

async def notify_clients(message):
    if connected_clients:
        await asyncio.wait([client.send(message) for client in connected_clients])

async def websocket_handler(websocket, path):
    await register(websocket)
    async for message in websocket:
        data = json.loads(message)
        if data['action'] == 'notification':
            await notify_clients(data['message'])

def start_websocket_server():
    return websockets.serve(websocket_handler, 'localhost', 8765)

def register_websocket_events():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_websocket_server())
    loop.run_forever()
