import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.models import MotorCommandRequest, ESP32StatusMessage
from app.motor_controller import MotorController
from app.websocket_manager import WebSocketManager
from app.main import app

client = TestClient(app)

# 1. Pydantic Command Validation Tests
def test_valid_forward_command():
    req = MotorCommandRequest(command="forward")
    assert req.command == "forward"
    assert req.speed is None

def test_valid_reverse_command():
    req = MotorCommandRequest(command="reverse")
    assert req.command == "reverse"

def test_valid_stop_command():
    req = MotorCommandRequest(command="stop")
    assert req.command == "stop"

def test_valid_emergency_stop_command():
    req = MotorCommandRequest(command="emergency_stop")
    assert req.command == "emergency_stop"

def test_valid_speed_0():
    req = MotorCommandRequest(command="set_speed", speed=0)
    assert req.speed == 0

def test_valid_speed_100():
    req = MotorCommandRequest(command="set_speed", speed=100)
    assert req.speed == 100

def test_invalid_speed_negative():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="set_speed", speed=-5)

def test_invalid_speed_over_100():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="set_speed", speed=101)

def test_set_speed_missing_speed():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="set_speed")

def test_invalid_command():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="fly")


# 2. MotorController State Machine & Safety Logic Tests
@pytest.mark.asyncio
async def test_motor_controller_transitions():
    ctrl = MotorController(simulation_mode=True)
    
    # Initial status
    status = ctrl.get_status()
    assert status.direction == "stop"
    assert status.speed == 0
    assert not status.emergency_stop
    
    # Forward command
    await ctrl.handle_command(MotorCommandRequest(command="forward"))
    status = ctrl.get_status()
    assert status.direction == "forward"
    assert status.speed > 0
    
    # Set speed to 75
    await ctrl.handle_command(MotorCommandRequest(command="set_speed", speed=75))
    status = ctrl.get_status()
    assert status.speed == 75
    
    # Reverse command
    await ctrl.handle_command(MotorCommandRequest(command="reverse"))
    status = ctrl.get_status()
    assert status.direction == "reverse"
    assert status.speed == 75
    
    # Stop command
    await ctrl.handle_command(MotorCommandRequest(command="stop"))
    status = ctrl.get_status()
    assert status.direction == "stop"
    assert status.speed == 0


@pytest.mark.asyncio
async def test_emergency_stop_fail_safe():
    ctrl = MotorController(simulation_mode=True)
    
    # Start moving
    await ctrl.handle_command(MotorCommandRequest(command="forward"))
    await ctrl.handle_command(MotorCommandRequest(command="set_speed", speed=80))
    
    # Trigger Emergency Stop
    await ctrl.handle_command(MotorCommandRequest(command="emergency_stop"))
    status = ctrl.get_status()
    assert status.emergency_stop is True
    assert status.direction == "stop"
    assert status.speed == 0
    
    # Any new move command should be REJECTED while emergency stop is active
    with pytest.raises(ValueError, match="Emergency stop is ACTIVE"):
        await ctrl.handle_command(MotorCommandRequest(command="forward"))
        
    with pytest.raises(ValueError, match="Emergency stop is ACTIVE"):
        await ctrl.handle_command(MotorCommandRequest(command="set_speed", speed=50))
        
    # Must explicitly issue 'stop' to clear emergency halt
    await ctrl.handle_command(MotorCommandRequest(command="stop"))
    status = ctrl.get_status()
    assert status.emergency_stop is False
    assert status.direction == "stop"


def test_esp32_connection_and_disconnection():
    ctrl = MotorController(simulation_mode=False)
    assert not ctrl.esp32_connected
    
    # Connect
    ctrl.set_esp32_connection(True)
    assert ctrl.esp32_connected is True
    assert ctrl.last_heartbeat is not None
    
    # Disconnect
    ctrl.set_esp32_connection(False)
    assert ctrl.esp32_connected is False
    assert ctrl.current_speed == 0
    assert ctrl.current_direction == "stop"


# 3. REST API Tests
def test_rest_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "simulation_mode" in data

def test_rest_status_endpoint():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "direction" in data
    assert "speed" in data
    assert "emergency_stop" in data

def test_rest_motor_command_success():
    response = client.post("/api/motor/command", json={"command": "forward"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_rest_motor_command_speed():
    response = client.post("/api/motor/command", json={"command": "set_speed", "speed": 85})
    assert response.status_code == 200
    data = response.json()
    assert data["status"]["speed"] == 85

def test_rest_motor_command_invalid():
    response = client.post("/api/motor/command", json={"command": "invalid_cmd"})
    assert response.status_code == 422  # Unprocessable Entity from Pydantic

def test_rest_motor_command_invalid_speed():
    response = client.post("/api/motor/command", json={"command": "set_speed", "speed": 150})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_independent_motor_a_and_b_commands():
    ctrl = MotorController(simulation_mode=True)
    
    # Motor A forward at 60%
    await ctrl.handle_command(MotorCommandRequest(command="motor_a_forward", speed=60))
    st = ctrl.get_status()
    assert st.motor_a_dir == "forward"
    assert st.motor_a_speed == 60
    assert st.motor_b_dir == "stop"
    
    # Motor B backward at 80%
    await ctrl.handle_command(MotorCommandRequest(command="motor_b_backward", speed=80))
    st = ctrl.get_status()
    assert st.motor_a_dir == "forward"
    assert st.motor_a_speed == 60
    assert st.motor_b_dir == "backward"
    assert st.motor_b_speed == 80
    
    # Stop Motor A independently
    await ctrl.handle_command(MotorCommandRequest(command="motor_a_stop"))
    st = ctrl.get_status()
    assert st.motor_a_dir == "stop"
    assert st.motor_a_speed == 0
    assert st.motor_b_dir == "backward"
    assert st.motor_b_speed == 80
    
    # Stop Motor B independently
    await ctrl.handle_command(MotorCommandRequest(command="motor_b_stop"))
    st = ctrl.get_status()
    assert st.motor_a_dir == "stop"
    assert st.motor_b_dir == "stop"


def test_valid_servo_angles():
    req0 = MotorCommandRequest(command="set_servo_angle", angle=0)
    assert req0.angle == 0
    req90 = MotorCommandRequest(command="set_servo_angle", angle=90)
    assert req90.angle == 90
    req180 = MotorCommandRequest(command="set_servo_angle", angle=180)
    assert req180.angle == 180


def test_invalid_servo_angle_negative():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="set_servo_angle", angle=-1)


def test_invalid_servo_angle_over_180():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="set_servo_angle", angle=181)


def test_missing_servo_angle():
    with pytest.raises(ValidationError):
        MotorCommandRequest(command="set_servo_angle")


@pytest.mark.asyncio
async def test_servo_motor_controller_handling():
    ctrl = MotorController(simulation_mode=True)
    assert ctrl.servo_angle == 90
    assert ctrl.get_status().servo_angle == 90

    await ctrl.handle_command(MotorCommandRequest(command="set_servo_angle", angle=135))
    assert ctrl.servo_angle == 135
    assert ctrl.get_status().servo_angle == 135


