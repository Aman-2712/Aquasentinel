import json
import logging
from datetime import datetime
from typing import Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from app.models import MotorStatus, ESP32CommandPayload, ESP32StatusMessage, MotorCommandRequest
from app.motor_controller import MotorController

logger = logging.getLogger("websocket_manager")

class WebSocketManager:
    def __init__(self, controller: MotorController):
        self.controller = controller
        self.dashboard_sockets: Set[WebSocket] = set()
        self.esp32_socket: Optional[WebSocket] = None

        # Hook controller status notification
        self.controller.register_status_callback(self.broadcast_status)

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboard_sockets.add(websocket)
        logger.info(f"Dashboard client connected. Total: {len(self.dashboard_sockets)}")
        # Send current status immediately
        await self.send_status_to_client(websocket, self.controller.get_status())

    def disconnect_dashboard(self, websocket: WebSocket):
        self.dashboard_sockets.discard(websocket)
        logger.info(f"Dashboard client disconnected. Total: {len(self.dashboard_sockets)}")

    async def connect_esp32(self, websocket: WebSocket):
        await websocket.accept()
        self.esp32_socket = websocket
        self.controller.set_esp32_connection(True)
        self.controller.last_heartbeat = datetime.now()
        logger.info("Physical ESP32 WebSocket connected and ready for commands!")
        await self.broadcast_status(self.controller.get_status())

    async def disconnect_esp32(self):
        self.esp32_socket = None
        self.controller.set_esp32_connection(False)
        logger.warning("Hardware ESP32 WebSocket disconnected!")
        await self.broadcast_status(self.controller.get_status())

    async def send_status_to_client(self, websocket: WebSocket, status: MotorStatus):
        try:
            status_dict = status.model_dump()
            status_dict["connected_dashboards"] = len(self.dashboard_sockets)
            if status_dict.get("last_heartbeat"):
                status_dict["last_heartbeat"] = status_dict["last_heartbeat"].isoformat()
            await websocket.send_text(json.dumps(status_dict))
        except Exception as e:
            logger.error(f"Error sending status to client: {e}")

    async def broadcast_status(self, status: MotorStatus):
        if not self.dashboard_sockets:
            return
        status_dict = status.model_dump()
        status_dict["connected_dashboards"] = len(self.dashboard_sockets)
        if status_dict.get("last_heartbeat"):
            status_dict["last_heartbeat"] = status_dict["last_heartbeat"].isoformat()
        message = json.dumps(status_dict)

        disconnected_clients = set()
        for client in self.dashboard_sockets:
            try:
                await client.send_text(message)
            except Exception:
                disconnected_clients.add(client)

        for dead_client in disconnected_clients:
            self.dashboard_sockets.discard(dead_client)

    async def dispatch_command(self, cmd_req: MotorCommandRequest) -> ESP32CommandPayload:
        """Validates command and forwards to physical ESP32 if connected"""
        payload = await self.controller.handle_command(cmd_req)

        # Forward directly to the physical ESP32
        if self.esp32_socket:
            try:
                raw_json = payload.model_dump_json()
                await self.esp32_socket.send_text(raw_json)
                logger.info(f"SUCCESS: Forwarded command to physical ESP32: {raw_json}")
            except Exception as e:
                logger.error(f"Failed to forward command to ESP32: {e}")
                await self.disconnect_esp32()
        else:
            logger.warning("Command received but physical ESP32 is not currently connected to WebSocket!")

        return payload

    async def handle_esp32_message(self, raw_data: str):
        """Processes telemetry from ESP32"""
        try:
            data = json.loads(raw_data)
            status_msg = ESP32StatusMessage(**data)
            self.controller.update_from_esp32_status(status_msg)
            await self.broadcast_status(self.controller.get_status())
        except Exception as e:
            logger.error(f"Failed to parse ESP32 message: {e}. Raw: {raw_data}")
