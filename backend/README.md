# FastAPI IoT LED & Motor Controller Backend

FastAPI asynchronous backend server providing WebSocket command relay and telemetry synchronization between the Next.js Web Dashboard and the ESP32 microcontroller.

## Features
- **Centralized WebSocket Server**:
  - `/ws/dashboard`: Bidirectional JSON connection for Next.js web clients.
  - `/ws/esp32`: Dedicated hardware socket for the ESP32.
- **Fail-Safe Command Validation**:
  - Pydantic models validate all incoming directions and bounds (`0 <= speed <= 100`).
  - Emergency stop locks the system and stops all movement/illumination until cleared with a `stop` command.
- **Built-in Simulation Mode**:
  - When `SIMULATION_MODE=true`, the backend simulates ESP32 connection and telemetry, enabling full end-to-end testing without hardware.
- **REST Endpoints**:
  - `GET /api/health`: Healthcheck and connection mode.
  - `GET /api/status`: Current telemetry snapshot.
  - `POST /api/motor/command`: REST alternative for command dispatch.

## Setup & Running

1. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Run automated tests**:
   ```bash
   pytest tests/ -v
   ```
