# Next.js ESP32 IoT Actuator Dashboard

Modern industrial control dashboard built with Next.js (App Router), TypeScript, and Tailwind CSS. Communicates in real-time with the FastAPI WebSocket backend to command and monitor ESP32 actuators and onboard LEDs.

## Features
- **Real-Time Dual Indicators**: Displays connection status for both FastAPI backend and ESP32 hardware.
- **Actuator Telemetry Visualizer**: Circular SVG tachometer gauge, dynamic speed/PWM percentage (0–100%), active directional spinner, and LED mode state.
- **Fail-Safe Control Panel**:
  - `FORWARD`: Drives actuator forward (or solid LED).
  - `REVERSE`: Drives actuator in reverse (or pulsing LED).
  - `STOP`: Graceful zero-speed cutoff and clears emergency-stop lockout.
  - `EMERGENCY STOP`: Large, prominent red button for immediate zero-PWM cutoff.
  - `Target Speed Slider`: Smooth 0–100% control with quick presets (0%, 25%, 50%, 75%, 100%).
- **Live Activity Feed**: Real-time console displaying WebSocket sent/received packets.
- **Fail-Safe Warnings**: Dynamic banners indicating emergency halt or communication loss.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
