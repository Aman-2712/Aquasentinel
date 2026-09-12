import asyncio
import logging
from datetime import datetime
from typing import Optional
from app.models import MotorCommandRequest, ESP32CommandPayload, MotorStatus, ESP32StatusMessage
from app.config import settings

logger = logging.getLogger("motor_controller")

class MotorController:
    def __init__(self, simulation_mode: bool = settings.SIMULATION_MODE):
        self.simulation_mode = simulation_mode
        self.esp32_connected: bool = simulation_mode
        self.emergency_stop: bool = False
        self.led_on: bool = False
        
        # Independent Motor A & Motor B States
        self.motor_a_dir: str = "stop"
        self.motor_a_speed: int = 75
        self.motor_b_dir: str = "stop"
        self.motor_b_speed: int = 75

        # Servo Motor State (0 to 180 degrees)
        self.servo_angle: int = 90

        self.last_heartbeat: Optional[datetime] = datetime.now() if simulation_mode else None
        self.device_id: str = settings.DEVICE_ID
        self._status_callbacks = []

    def register_status_callback(self, callback):
        self._status_callbacks.append(callback)

    async def _notify_status(self):
        status = self.get_status()
        for cb in self._status_callbacks:
            try:
                await cb(status)
            except Exception as e:
                logger.error(f"Error in status callback: {e}")

    def get_status(self) -> MotorStatus:
        overall_speed = max(
            self.motor_a_speed if self.motor_a_dir != "stop" else 0,
            self.motor_b_speed if self.motor_b_dir != "stop" else 0
        )
        overall_dir = "stop"
        if self.motor_a_dir == "forward" and self.motor_b_dir == "forward":
            overall_dir = "forward"
        elif self.motor_a_dir == "backward" and self.motor_b_dir == "backward":
            overall_dir = "reverse"
        elif self.motor_a_dir != "stop" or self.motor_b_dir != "stop":
            overall_dir = "running"

        return MotorStatus(
            device=self.device_id,
            connected=self.esp32_connected,
            direction=overall_dir,
            speed=overall_speed,
            emergency_stop=self.emergency_stop,
            last_heartbeat=self.last_heartbeat,
            simulation_mode=self.simulation_mode,
            led_state="ON" if self.led_on else "OFF",
            led_on=self.led_on,
            motor_a_dir=self.motor_a_dir,
            motor_a_speed=self.motor_a_speed if self.motor_a_dir != "stop" else 0,
            motor_b_dir=self.motor_b_dir,
            motor_b_speed=self.motor_b_speed if self.motor_b_dir != "stop" else 0,
            servo_angle=self.servo_angle
        )

    @property
    def current_speed(self) -> int:
        if self.motor_a_dir == "stop" and self.motor_b_dir == "stop":
            return 0
        return max(
            self.motor_a_speed if self.motor_a_dir != "stop" else 0,
            self.motor_b_speed if self.motor_b_dir != "stop" else 0
        )

    @property
    def current_direction(self) -> str:
        if self.motor_a_dir == "forward" and self.motor_b_dir == "forward":
            return "forward"
        elif self.motor_a_dir == "backward" and self.motor_b_dir == "backward":
            return "reverse"
        elif self.motor_a_dir == "stop" and self.motor_b_dir == "stop":
            return "stop"
        return "running"

    def set_esp32_connection(self, connected: bool):
        self.esp32_connected = connected
        if connected:
            self.last_heartbeat = datetime.now()
            logger.info("ESP32 connected")
        else:
            logger.warning("ESP32 disconnected")
            self.motor_a_dir = "stop"
            self.motor_b_dir = "stop"

    def update_from_esp32_status(self, msg: ESP32StatusMessage):
        self.esp32_connected = True
        self.last_heartbeat = datetime.now()
        if msg.emergency_stop is not None:
            self.emergency_stop = msg.emergency_stop
        if msg.device:
            self.device_id = msg.device
        if msg.led_on is not None:
            self.led_on = msg.led_on
        elif msg.led_state:
            self.led_on = "ON" in msg.led_state.upper()

        if msg.motor_a_dir:
            self.motor_a_dir = msg.motor_a_dir
        if msg.motor_a_speed is not None:
            self.motor_a_speed = msg.motor_a_speed
        if msg.motor_b_dir:
            self.motor_b_dir = msg.motor_b_dir
        if msg.motor_b_speed is not None:
            self.motor_b_speed = msg.motor_b_speed
        if msg.servo_angle is not None:
            self.servo_angle = msg.servo_angle

    async def handle_command(self, cmd_req: MotorCommandRequest) -> ESP32CommandPayload:
        cmd = cmd_req.command

        # Emergency Stop Hard Override
        if cmd == "emergency_stop":
            self.emergency_stop = True
            self.motor_a_dir = "stop"
            self.motor_b_dir = "stop"
            logger.warning("EMERGENCY STOP TRIGGERED!")
            await self._notify_status()
            return ESP32CommandPayload(command="emergency_stop")

        # Clear Emergency Stop
        if self.emergency_stop:
            if cmd in ("stop", "motor_a_stop", "motor_b_stop"):
                self.emergency_stop = False
                self.motor_a_dir = "stop"
                self.motor_b_dir = "stop"
                logger.info("Emergency stop cleared.")
                await self._notify_status()
                return ESP32CommandPayload(command="stop")
            elif cmd in ("turn_off", "turn_on", "toggle", "set_led"):
                pass
            else:
                raise ValueError("Emergency stop is ACTIVE! Issue a 'stop' command first to reset.")

        # LED Controls
        if cmd == "turn_on" or (cmd == "set_led" and cmd_req.state is True):
            self.led_on = True
        elif cmd == "turn_off" or (cmd == "set_led" and cmd_req.state is False):
            self.led_on = False
        elif cmd == "toggle":
            self.led_on = not self.led_on

        # Servo Motor Control (0° - 180°)
        elif cmd == "set_servo_angle":
            if cmd_req.angle is None:
                raise ValueError("Angle is required for set_servo_angle")
            self.servo_angle = cmd_req.angle

        # Motor A Controls
        elif cmd == "motor_a_forward":
            self.motor_a_dir = "forward"
            if cmd_req.speed is not None:
                self.motor_a_speed = cmd_req.speed
        elif cmd == "motor_a_backward":
            self.motor_a_dir = "backward"
            if cmd_req.speed is not None:
                self.motor_a_speed = cmd_req.speed
        elif cmd == "motor_a_stop":
            self.motor_a_dir = "stop"

        # Motor B Controls
        elif cmd == "motor_b_forward":
            self.motor_b_dir = "forward"
            if cmd_req.speed is not None:
                self.motor_b_speed = cmd_req.speed
        elif cmd == "motor_b_backward":
            self.motor_b_dir = "backward"
            if cmd_req.speed is not None:
                self.motor_b_speed = cmd_req.speed
        elif cmd == "motor_b_stop":
            self.motor_b_dir = "stop"

        # Set individual speed / RPM
        elif cmd == "set_motor_speed":
            if cmd_req.speed is None:
                raise ValueError("Speed is required for set_motor_speed")
            if cmd_req.motor == "a":
                self.motor_a_speed = cmd_req.speed
            elif cmd_req.motor == "b":
                self.motor_b_speed = cmd_req.speed
            else:
                self.motor_a_speed = cmd_req.speed
                self.motor_b_speed = cmd_req.speed

        # Legacy global commands
        elif cmd == "forward":
            self.motor_a_dir = "forward"
            self.motor_b_dir = "forward"
            if cmd_req.speed is not None:
                self.motor_a_speed = cmd_req.speed
                self.motor_b_speed = cmd_req.speed
        elif cmd in ("reverse", "backward"):
            self.motor_a_dir = "backward"
            self.motor_b_dir = "backward"
            if cmd_req.speed is not None:
                self.motor_a_speed = cmd_req.speed
                self.motor_b_speed = cmd_req.speed
        elif cmd == "stop":
            self.motor_a_dir = "stop"
            self.motor_b_dir = "stop"
        elif cmd == "set_speed":
            if cmd_req.speed is not None:
                self.motor_a_speed = cmd_req.speed
                self.motor_b_speed = cmd_req.speed

        if self.simulation_mode:
            self.last_heartbeat = datetime.now()

        await self._notify_status()
        return ESP32CommandPayload(
            command=cmd,
            motor=cmd_req.motor,
            direction=cmd_req.direction,
            speed=cmd_req.speed,
            angle=cmd_req.angle,
            state=self.led_on
        )

    async def start_simulation_loop(self):
        if not self.simulation_mode:
            return
        try:
            while True:
                await asyncio.sleep(settings.HEARTBEAT_INTERVAL)
                self.last_heartbeat = datetime.now()
                self.esp32_connected = True
                await self._notify_status()
        except asyncio.CancelledError:
            pass
