/**
 * ============================================================================
 * ESP32 Controller: Independent Motor A & Motor B (L298N) + Onboard LED
 * ============================================================================
 * Hardware:
 *   1. ESP32 Development Board
 *   2. Onboard LED on GPIO 2
 *   3. L298N Dual Motor Driver:
 *      - Motor A: ENA (GPIO 14), IN1 (GPIO 26), IN2 (GPIO 27)
 *      - Motor B: ENB (GPIO 13), IN3 (GPIO 32), IN4 (GPIO 33)
 * ============================================================================
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// ============================================================================
// 1. NETWORK CONFIGURATION
// ============================================================================
const char* WIFI_SSID     = "12345678";
const char* WIFI_PASSWORD = "00000000";

const char* SERVER_HOST   = "10.38.152.235";
const int   SERVER_PORT   = 8000;
const char* SERVER_PATH   = "/ws/esp32";

const char* DEVICE_ID     = "esp32-motor-01";

// ============================================================================
// 2. HARDWARE GPIO PIN CONFIGURATION
// ============================================================================
// 2.1 Onboard LED
#define ONBOARD_LED_PIN   2     // Standard ESP32 onboard LED

// 2.2 Motor A (Channel 1)
#define MOTOR_ENA_PIN     14    // PWM speed for Motor A (remove jumper)
#define MOTOR_IN1_PIN     26    // Direction 1
#define MOTOR_IN2_PIN     27    // Direction 2

// 2.3 Motor B (Channel 2)
#define MOTOR_ENB_PIN     13    // PWM speed for Motor B (remove jumper)
#define MOTOR_IN3_PIN     32    // Direction 1
#define MOTOR_IN4_PIN     33    // Direction 2

// 2.4 Servo Motor
#define SERVO_PIN         18    // PWM signal for Servo Motor (SG90 / MG996R)
#define SERVO_PWM_CHANNEL 2     // LEDC Channel for Servo (Core 2.x)
#define SERVO_FREQ        50    // 50 Hz (20ms standard servo period)
#define SERVO_RES         16    // 16-bit resolution (0 to 65535)

// PWM Configuration
#define PWM_FREQ          5000  // 5 kHz frequency for DC motors
#define PWM_RES           8     // 8-bit resolution (0 to 255)
#define PWM_CHANNEL_A     0     // LEDC Channel A (Core 2.x)
#define PWM_CHANNEL_B     1     // LEDC Channel B (Core 2.x)

// ============================================================================
// 3. GLOBAL STATE
// ============================================================================
WebSocketsClient webSocket;

// LED State
bool ledState = false;

// Motor A State
String motorADir    = "stop";  // "forward", "backward", "stop"
int    motorASpeed  = 75;      // 0 - 100%

// Motor B State
String motorBDir    = "stop";  // "forward", "backward", "stop"
int    motorBSpeed  = 75;      // 0 - 100%

// Servo Motor State (0 to 180 degrees)
int    servoAngle   = 90;

bool   emergencyStop = false;

unsigned long lastStatusTime = 0;
const unsigned long STATUS_INTERVAL_MS = 1000;

// ============================================================================
// 4. HARDWARE PWM HELPERS (Core 2.x & 3.x compatible)
// ============================================================================
void initPwmPin(uint8_t pin, uint8_t channel) {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttach(pin, PWM_FREQ, PWM_RES);
#else
  ledcSetup(channel, PWM_FREQ, PWM_RES);
  ledcAttachPin(pin, channel);
#endif
}

void writeMotorPwm(uint8_t pin, uint8_t channel, int duty) {
  duty = constrain(duty, 0, 255);
#if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcWrite(pin, duty);
#else
  ledcWrite(channel, duty);
#endif
}

void initServoPwm() {
#if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttach(SERVO_PIN, SERVO_FREQ, SERVO_RES);
#else
  ledcSetup(SERVO_PWM_CHANNEL, SERVO_FREQ, SERVO_RES);
  ledcAttachPin(SERVO_PIN, SERVO_PWM_CHANNEL);
#endif
}

void setServoAngle(int angle) {
  servoAngle = constrain(angle, 0, 180);
  // Standard servo 50Hz: 20000us period, 500us (0 deg) to 2400us (180 deg), 16-bit 65535
  uint32_t pulseUs = map(servoAngle, 0, 180, 500, 2400);
  uint32_t duty = (pulseUs * 65535ULL) / 20000ULL;
#if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcWrite(SERVO_PIN, duty);
#else
  ledcWrite(SERVO_PWM_CHANNEL, duty);
#endif
  Serial.printf("[SERVO] Angle set to %d deg (Pulse: %u us, Duty: %u)\n", servoAngle, pulseUs, duty);
}

// ============================================================================
// 5. ONBOARD LED CONTROL
// ============================================================================
void setLed(bool turnOn) {
  ledState = turnOn;
  digitalWrite(ONBOARD_LED_PIN, ledState ? HIGH : LOW);
  Serial.printf("[LED] %s (GPIO %d = %s)\n",
                ledState ? "ON" : "OFF",
                ONBOARD_LED_PIN,
                ledState ? "HIGH" : "LOW");
}

void toggleLed() {
  setLed(!ledState);
}

// ============================================================================
// 6. INDEPENDENT MOTOR CONTROL (MOTOR A & MOTOR B)
// ============================================================================
void motorA_forward(int speedPercent) {
  if (emergencyStop) return;
  motorASpeed = constrain(speedPercent, 0, 100);
  motorADir = "forward";
  int duty = map(motorASpeed, 0, 100, 0, 255);
  digitalWrite(MOTOR_IN1_PIN, HIGH);
  digitalWrite(MOTOR_IN2_PIN, LOW);
  writeMotorPwm(MOTOR_ENA_PIN, PWM_CHANNEL_A, duty);
  Serial.printf("[MOTOR A] FORWARD at %d%% (PWM: %d)\n", motorASpeed, duty);
}

void motorA_backward(int speedPercent) {
  if (emergencyStop) return;
  motorASpeed = constrain(speedPercent, 0, 100);
  motorADir = "backward";
  int duty = map(motorASpeed, 0, 100, 0, 255);
  digitalWrite(MOTOR_IN1_PIN, LOW);
  digitalWrite(MOTOR_IN2_PIN, HIGH);
  writeMotorPwm(MOTOR_ENA_PIN, PWM_CHANNEL_A, duty);
  Serial.printf("[MOTOR A] BACKWARD at %d%% (PWM: %d)\n", motorASpeed, duty);
}

void motorA_stop() {
  motorADir = "stop";
  digitalWrite(MOTOR_IN1_PIN, LOW);
  digitalWrite(MOTOR_IN2_PIN, LOW);
  writeMotorPwm(MOTOR_ENA_PIN, PWM_CHANNEL_A, 0);
  Serial.println("[MOTOR A] STOPPED.");
}

void motorB_forward(int speedPercent) {
  if (emergencyStop) return;
  motorBSpeed = constrain(speedPercent, 0, 100);
  motorBDir = "forward";
  int duty = map(motorBSpeed, 0, 100, 0, 255);
  digitalWrite(MOTOR_IN3_PIN, HIGH);
  digitalWrite(MOTOR_IN4_PIN, LOW);
  writeMotorPwm(MOTOR_ENB_PIN, PWM_CHANNEL_B, duty);
  Serial.printf("[MOTOR B] FORWARD at %d%% (PWM: %d)\n", motorBSpeed, duty);
}

void motorB_backward(int speedPercent) {
  if (emergencyStop) return;
  motorBSpeed = constrain(speedPercent, 0, 100);
  motorBDir = "backward";
  int duty = map(motorBSpeed, 0, 100, 0, 255);
  digitalWrite(MOTOR_IN3_PIN, LOW);
  digitalWrite(MOTOR_IN4_PIN, HIGH);
  writeMotorPwm(MOTOR_ENB_PIN, PWM_CHANNEL_B, duty);
  Serial.printf("[MOTOR B] BACKWARD at %d%% (PWM: %d)\n", motorBSpeed, duty);
}

void motorB_stop() {
  motorBDir = "stop";
  digitalWrite(MOTOR_IN3_PIN, LOW);
  digitalWrite(MOTOR_IN4_PIN, LOW);
  writeMotorPwm(MOTOR_ENB_PIN, PWM_CHANNEL_B, 0);
  Serial.println("[MOTOR B] STOPPED.");
}

void stopBothMotors() {
  emergencyStop = false;
  motorA_stop();
  motorB_stop();
}

void executeEmergencyStop() {
  emergencyStop = true;
  motorA_stop();
  motorB_stop();
  Serial.println("[SAFETY] !!! EMERGENCY STOP ACTIVATED !!!");
}

// ============================================================================
// 7. STATUS TELEMETRY
// ============================================================================
void sendTelemetryStatus() {
  StaticJsonDocument<300> doc;
  doc["type"] = "status";
  doc["device"] = DEVICE_ID;
  doc["connected"] = true;

  // LED State
  doc["led_on"] = ledState;
  doc["led_state"] = ledState ? "ON" : "OFF";

  // Motor States
  doc["motor_a_dir"] = motorADir;
  doc["motor_a_speed"] = (motorADir == "stop") ? 0 : motorASpeed;
  doc["motor_b_dir"] = motorBDir;
  doc["motor_b_speed"] = (motorBDir == "stop") ? 0 : motorBSpeed;

  // Servo State
  doc["servo_angle"] = servoAngle;

  doc["emergency_stop"] = emergencyStop;

  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
}

// ============================================================================
// 8. COMMAND PARSING
// ============================================================================
void handleCommandJson(uint8_t* payload, size_t length) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.print("[JSON] Parse error: ");
    Serial.println(error.c_str());
    return;
  }

  const char* cmd = doc["command"];
  if (!cmd) return;

  Serial.printf("[COMMAND] Received: %s\n", cmd);

  int spd = doc.containsKey("speed") ? (int)doc["speed"] : 75;

  // LED Commands
  if (strcmp(cmd, "turn_on") == 0) {
    setLed(true);
  } else if (strcmp(cmd, "turn_off") == 0) {
    setLed(false);
  } else if (strcmp(cmd, "toggle") == 0) {
    toggleLed();
  } else if (strcmp(cmd, "set_led") == 0) {
    if (doc.containsKey("state")) {
      setLed(doc["state"]);
    }
  }

  // Motor A Independent Commands
  else if (strcmp(cmd, "motor_a_forward") == 0) {
    motorA_forward(doc.containsKey("speed") ? spd : motorASpeed);
  } else if (strcmp(cmd, "motor_a_backward") == 0) {
    motorA_backward(doc.containsKey("speed") ? spd : motorASpeed);
  } else if (strcmp(cmd, "motor_a_stop") == 0) {
    motorA_stop();
  }

  // Motor B Independent Commands
  else if (strcmp(cmd, "motor_b_forward") == 0) {
    motorB_forward(doc.containsKey("speed") ? spd : motorBSpeed);
  } else if (strcmp(cmd, "motor_b_backward") == 0) {
    motorB_backward(doc.containsKey("speed") ? spd : motorBSpeed);
  } else if (strcmp(cmd, "motor_b_stop") == 0) {
    motorB_stop();
  }

  // Servo Angle Command
  else if (strcmp(cmd, "set_servo_angle") == 0) {
    if (doc.containsKey("angle")) {
      setServoAngle(doc["angle"]);
    }
  }

  // Speed Adjustment
  else if (strcmp(cmd, "set_motor_speed") == 0) {
    const char* target = doc["motor"];
    if (target && strcmp(target, "a") == 0) {
      motorASpeed = spd;
      if (motorADir == "forward") motorA_forward(motorASpeed);
      else if (motorADir == "backward") motorA_backward(motorASpeed);
    } else if (target && strcmp(target, "b") == 0) {
      motorBSpeed = spd;
      if (motorBDir == "forward") motorB_forward(motorBSpeed);
      else if (motorBDir == "backward") motorB_backward(motorBSpeed);
    } else {
      motorASpeed = spd;
      motorBSpeed = spd;
      if (motorADir == "forward") motorA_forward(motorASpeed);
      else if (motorADir == "backward") motorA_backward(motorASpeed);
      if (motorBDir == "forward") motorB_forward(motorBSpeed);
      else if (motorBDir == "backward") motorB_backward(motorBSpeed);
    }
  }

  // Global Motor Commands
  else if (strcmp(cmd, "emergency_stop") == 0) {
    executeEmergencyStop();
  } else if (strcmp(cmd, "stop") == 0) {
    stopBothMotors();
  } else if (strcmp(cmd, "forward") == 0) {
    motorA_forward(spd);
    motorB_forward(spd);
  } else if (strcmp(cmd, "reverse") == 0 || strcmp(cmd, "backward") == 0) {
    motorA_backward(spd);
    motorB_backward(spd);
  }

  sendTelemetryStatus();
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected from FastAPI backend!");
      stopBothMotors(); // Safety: stop motors if connection is lost
      break;
    case WStype_CONNECTED:
      Serial.printf("[WS] Connected to %s:%d%s\n", SERVER_HOST, SERVER_PORT, SERVER_PATH);
      sendTelemetryStatus();
      break;
    case WStype_TEXT:
      handleCommandJson(payload, length);
      break;
    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
    case WStype_PING:
    case WStype_PONG:
      break;
  }
}

// ============================================================================
// 9. SETUP & MAIN LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n========================================================");
  Serial.println(" ESP32: Dual Independent Motor Driver (L298N) + LED");
  Serial.println("========================================================");

  // 1. Initialize Onboard LED
  pinMode(ONBOARD_LED_PIN, OUTPUT);
  setLed(false);

  // 2. Initialize Motor A Pins
  pinMode(MOTOR_IN1_PIN, OUTPUT);
  pinMode(MOTOR_IN2_PIN, OUTPUT);
  digitalWrite(MOTOR_IN1_PIN, LOW);
  digitalWrite(MOTOR_IN2_PIN, LOW);

  pinMode(MOTOR_ENA_PIN, OUTPUT);
  initPwmPin(MOTOR_ENA_PIN, PWM_CHANNEL_A);
  writeMotorPwm(MOTOR_ENA_PIN, PWM_CHANNEL_A, 0);

  // 3. Initialize Motor B Pins
  pinMode(MOTOR_IN3_PIN, OUTPUT);
  pinMode(MOTOR_IN4_PIN, OUTPUT);
  digitalWrite(MOTOR_IN3_PIN, LOW);
  digitalWrite(MOTOR_IN4_PIN, LOW);

  pinMode(MOTOR_ENB_PIN, OUTPUT);
  initPwmPin(MOTOR_ENB_PIN, PWM_CHANNEL_B);
  writeMotorPwm(MOTOR_ENB_PIN, PWM_CHANNEL_B, 0);

  // 4. Initialize Servo Motor
  pinMode(SERVO_PIN, OUTPUT);
  initServoPwm();
  setServoAngle(90);

  Serial.println("[HW] Motor A: ENA=14, IN1=26, IN2=27");
  Serial.println("[HW] Motor B: ENB=13, IN3=32, IN4=33");
  Serial.println("[HW] Servo Motor: GPIO 18 (PWM 50Hz, 0-180 deg)");
  Serial.println("[HW] Onboard LED: GPIO 2");

  // 4. Connect to Wi-Fi
  Serial.printf("[WIFI] Connecting to %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int wifiRetries = 0;
  while (WiFi.status() != WL_CONNECTED && wifiRetries < 30) {
    delay(500);
    Serial.print(".");
    wifiRetries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected successfully!");
    Serial.print("[WIFI] ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WIFI] Connection pending. Retrying in background...");
  }

  // 5. Connect to WebSocket Server
  webSocket.begin(SERVER_HOST, SERVER_PORT, SERVER_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(2000);
  webSocket.enableHeartbeat(5000, 3000, 2);
}

void loop() {
  webSocket.loop();

  unsigned long now = millis();

  // 1. Wi-Fi Auto-reconnect safeguard
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastWifiCheck = 0;
    if (now - lastWifiCheck > 5000) {
      lastWifiCheck = now;
      Serial.println("[WIFI] Reconnecting to Wi-Fi...");
      WiFi.reconnect();
    }
  }

  // 2. Periodic Status Telemetry to Backend
  if (now - lastStatusTime >= STATUS_INTERVAL_MS) {
    lastStatusTime = now;
    if (webSocket.isConnected()) {
      sendTelemetryStatus();
    }
  }
}
