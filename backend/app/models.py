from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Literal
from datetime import datetime

# Allowed commands
CommandType = Literal[
    "motor_a_forward", "motor_a_backward", "motor_a_stop",
    "motor_b_forward", "motor_b_backward", "motor_b_stop",
    "set_motor_speed",
    "set_servo_angle",
    "forward", "reverse", "left", "right", "stop", "set_speed", "emergency_stop",
    "turn_on", "turn_off", "toggle", "set_led"
]

class MotorCommandRequest(BaseModel):
    command: CommandType = Field(..., description="Action to perform")
    motor: Optional[Literal["a", "b", "all"]] = Field(default=None, description="Target motor (a or b)")
    direction: Optional[Literal["forward", "backward", "reverse", "stop"]] = None
    speed: Optional[int] = Field(default=None, description="Motor speed/RPM percentage from 0 to 100")
    angle: Optional[int] = Field(default=None, ge=0, le=180, description="Servo angle in degrees (0 to 180)")
    state: Optional[bool] = Field(default=None, description="Boolean state for set_led")

    @field_validator("speed")
    @classmethod
    def validate_speed(cls, v, info):
        if v is not None:
            if not isinstance(v, int):
                raise ValueError("Speed must be an integer")
            if v < 0 or v > 100:
                raise ValueError(f"Speed must be between 0 and 100. Received: {v}")
        return v

    @model_validator(mode="after")
    def validate_command_payload(self):
        if self.command in ("set_speed", "set_motor_speed") and self.speed is None:
            raise ValueError(f"Speed is required for {self.command}")
        if self.command == "set_servo_angle" and self.angle is None:
            raise ValueError("Angle is required for set_servo_angle")
        return self


class ESP32CommandPayload(BaseModel):
    type: Literal["motor_command"] = "motor_command"
    command: CommandType
    motor: Optional[str] = None
    direction: Optional[str] = None
    speed: Optional[int] = None
    angle: Optional[int] = None
    state: Optional[bool] = None


class MotorStatus(BaseModel):
    type: Literal["status"] = "status"
    device: str = "esp32-motor-01"
    connected: bool = False
    direction: str = "stop"
    speed: int = 0
    emergency_stop: bool = False
    last_heartbeat: Optional[datetime] = None
    connected_dashboards: int = 0
    simulation_mode: bool = False
    led_state: Optional[str] = "OFF"
    led_on: bool = False
    
    # Individual motor status
    motor_a_dir: str = "stop"
    motor_a_speed: int = 0
    motor_b_dir: str = "stop"
    motor_b_speed: int = 0

    # Servo motor status (0 - 180 degrees)
    servo_angle: int = 90


class ESP32StatusMessage(BaseModel):
    type: Literal["status", "heartbeat"] = "status"
    device: str = "esp32-motor-01"
    connected: bool = True
    direction: Optional[str] = "stop"
    speed: Optional[int] = 0
    emergency_stop: Optional[bool] = False
    led_state: Optional[str] = None
    led_on: Optional[bool] = None
    
    motor_a_dir: Optional[str] = None
    motor_a_speed: Optional[int] = None
    motor_b_dir: Optional[str] = None
    motor_b_speed: Optional[int] = None
    motor_a: Optional[str] = None
    motor_b: Optional[str] = None
    servo_angle: Optional[int] = None
