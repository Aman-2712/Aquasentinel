# ESP32 IoT Dual Motor (L298N) & Onboard LED Control System

A complete IoT hardware control system connecting a modern **Next.js Web Dashboard** to an **ESP32 microcontroller** through a central **FastAPI WebSocket Backend**.

Controls both the **ESP32 Onboard Status LED** and an **L298N Dual H-Bridge Motor Module (driving 2 DC Motors)** simultaneously in real-time.

```
+-----------------------------------------------------------------+
|                        Next.js Dashboard                        |
|                                                                 |
|   [ Onboard LED Toggle ]          [ L298N Dual Motor Pad ]     |
|   - Real-time Lamp Visualizer     - Keypad: FWD / REV / L / R   |
|   - Instant ON/OFF                - Speed Slider: 0 - 100%      |
|                                   - EMERGENCY STOP Hard Brake   |
+--------------------------------+--------------------------------+
                                 |
                        WebSocket /ws/dashboard
                        REST /api/motor/command
                                 v
+-----------------------------------------------------------------+
|                       FastAPI Server                            |
|        Command Validation & Direct WebSocket Relay             |
+--------------------------------+--------------------------------+
                                 |
                        WebSocket /ws/esp32
                                 v
+-----------------------------------------------------------------+
|                       ESP32 Microcontroller                     |
|                                                                 |
|   GPIO 2 (Onboard LED)               GPIOs 14,26,27 & 13,32,33  |
|          |                                       |              |
|          v                                       v              |
|     Onboard LED                          L298N Motor Driver     |
|                                                  |              |
|                                           +------+------+       |
|                                           |             |       |
|                                        Motor A       Motor B    |
|                                        (Left)        (Right)    |
+-----------------------------------------------------------------+
```

---

## Hardware Wiring Guide (ESP32 to L298N & Motors)

### 1. Pin Mapping Summary
| Device | ESP32 GPIO | L298N Pin | Function |
|---|---|---|---|
| **Onboard LED** | **GPIO 2** | Built-in | System Status / LED Power |
| **Motor A (Left)** | **GPIO 14** | `ENA` | Hardware PWM Speed Control *(or keep jumper)* |
| **Motor A (Left)** | **GPIO 26** | `IN1` | Direction Pin 1 |
| **Motor A (Left)** | **GPIO 27** | `IN2` | Direction Pin 2 |
| **Motor B (Right)** | **GPIO 13** | `ENB` | Hardware PWM Speed Control *(or keep jumper)* |
| **Motor B (Right)** | **GPIO 32** | `IN3` | Direction Pin 1 |
| **Motor B (Right)** | **GPIO 33** | `IN4` | Direction Pin 2 |
| **Power** | **GND** | `GND` | Common Ground Connection *(Crucial!)* |

### 2. Physical Wiring Diagram (ASCII)
```
  +------------------+                   +--------------------------+
  |      ESP32       |                   |    L298N Motor Driver    |
  |                  |                   |                          |
  |  GPIO 14 (PWM) --+------------------>| ENA (Remove jumper)      |
  |  GPIO 26 --------+------------------>| IN1                      |
  |  GPIO 27 --------+------------------>| IN2                      |
  |                  |                   | OUT1 --------------------+----> Motor A (Left)
  |  GPIO 13 (PWM) --+------------------>| ENB (Remove jumper)      |   |
  |  GPIO 32 --------+------------------>| IN3                      |
  |  GPIO 33 --------+------------------>| IN4                      |
  |                  |                   | OUT3 --------------------+----> Motor B (Right)
  |  GND ------------+------------------>| GND                      |   |
  +------------------+                   |                          |
                                         | +12V / VCC <-------------+-- (+) External Battery (6V–12V)
                                         | GND <--------------------+-- (-) External Battery Ground
                                         +--------------------------+
```

> [!CAUTION]
> **COMMON GROUND IS MANDATORY**: You MUST connect the `GND` pin of the ESP32 to the `GND` terminal of the L298N and the negative terminal of your battery. If grounds are not shared, logic signals will float and the motors will not respond.
> **DO NOT POWER MOTORS FROM ESP32**: Never power motors directly from the ESP32 3.3V or 5V rails. Always use an external battery (e.g. 7.4V 2S Li-ion or 4x AA batteries or 12V supply) connected to the L298N power terminal.

---

## How to Flash & Run

### Step 1: Upload Firmware to ESP32
1. Open [`esp32/motor_controller/motor_controller.ino`](file:///c:/Users/R%20JYOSHNA/Desktop/sample/motor-control-system/esp32/motor_controller/motor_controller.ino) in Arduino IDE.
2. Verify your Wi-Fi credentials and the FastAPI server IP:
   ```cpp
   const char* WIFI_SSID     = "12345678";
   const char* WIFI_PASSWORD = "00000000";
   const char* SERVER_HOST   = "10.38.152.235";
   const int   SERVER_PORT   = 8000;
   ```
3. Click **Upload (`→`)** to flash your ESP32.
4. Open the Serial Monitor at **115200 baud** to see:
   ```text
   [HW] Pins Initialized: LED (GPIO 2), Motor A (14,26,27), Motor B (13,32,33)
   [WIFI] Connected successfully!
   [WS] Connected to 10.38.152.235:8000/ws/esp32
   ```

### Step 2: Open Dashboard
1. Open your browser at **[http://localhost:3000](http://localhost:3000)**.
2. The dashboard shows:
   - **ESP32 Onboard LED Card**: Click **TURN ON LED** to toggle the blue LED on GPIO 2.
   - **Dual Motor Controller**:
     - **`▲ FWD`**: Both motors drive forward.
     - **`▼ REV`**: Both motors drive in reverse.
     - **`◄ LEFT`**: Skid-steer left turn (Motor A reverse, Motor B forward).
     - **`► RIGHT`**: Skid-steer right turn (Motor A forward, Motor B reverse).
     - **`■ STOP`**: Graceful stop on both motors.
     - **Speed Slider**: Real-time hardware PWM adjustment from `0%` to `100%`.
     - **EMERGENCY STOP**: Large red button for instant hard braking.
