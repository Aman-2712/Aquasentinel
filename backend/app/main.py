import asyncio
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import MotorCommandRequest, MotorStatus
from app.motor_controller import MotorController
from app.websocket_manager import WebSocketManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

controller = MotorController()
ws_manager = WebSocketManager(controller)

@asynccontextmanager
async def lifespan(app: FastAPI):
    sim_task = None
    if settings.SIMULATION_MODE:
        sim_task = asyncio.create_task(controller.start_simulation_loop())
        logger.info("Simulation mode is ENABLED.")
    else:
        logger.info("Simulation mode is DISABLED. Expecting hardware ESP32 connection.")

    yield

    if sim_task:
        sim_task.cancel()

app = FastAPI(
    title="ESP32 IoT LED Controller API",
    description="Real-time WebSocket & REST backend for ESP32 actuator control",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time
import httpx
from fastapi.responses import Response

@app.get("/api/camera/snapshot")
async def proxy_camera_snapshot(target: str = "http://10.38.152.203/capture"):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(target)
            if resp.status_code == 200:
                filename = f"esp32-snapshot-{int(time.time())}.jpg"
                return Response(
                    content=resp.content,
                    media_type="image/jpeg",
                    headers={
                        "Content-Disposition": f"attachment; filename={filename}"
                    }
                )
            else:
                raise HTTPException(status_code=resp.status_code, detail=f"Camera returned {resp.status_code}")
    except Exception as e:
        logger.error(f"Snapshot proxy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def get_health():
    return {
        "status": "healthy",
        "service": "iot-led-controller",
        "simulation_mode": controller.simulation_mode,
        "esp32_connected": controller.esp32_connected,
        "led_on": controller.led_on
    }

@app.get("/api/status", response_model=MotorStatus)
async def get_status():
    status = controller.get_status()
    status.connected_dashboards = len(ws_manager.dashboard_sockets)
    return status

@app.post("/api/motor/command")
async def post_motor_command(cmd_req: MotorCommandRequest):
    try:
        payload = await ws_manager.dispatch_command(cmd_req)
        return {
            "success": True,
            "message": f"Command '{cmd_req.command}' dispatched successfully",
            "payload": payload,
            "status": controller.get_status()
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Command execution error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@app.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    await ws_manager.connect_dashboard(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                raw_json = json.loads(data)
                cmd_req = MotorCommandRequest(**raw_json)
                await ws_manager.dispatch_command(cmd_req)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "Invalid JSON"}))
            except ValueError as ve:
                await websocket.send_text(json.dumps({"type": "error", "message": str(ve)}))
            except Exception as e:
                logger.error(f"Error handling dashboard command: {e}")
                await websocket.send_text(json.dumps({"type": "error", "message": "Failed to process command"}))
    except WebSocketDisconnect:
        ws_manager.disconnect_dashboard(websocket)

@app.websocket("/ws/esp32")
async def websocket_esp32_endpoint(websocket: WebSocket):
    await ws_manager.connect_esp32(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.handle_esp32_message(data)
    except WebSocketDisconnect:
        logger.info("Hardware ESP32 socket disconnected.")
    except Exception as e:
        logger.error(f"ESP32 socket error: {e}")
    finally:
        await ws_manager.disconnect_esp32()
