'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardWebSocketClient } from '@/lib/websocket';
import { MotorCommand, MotorStatus, ConnectionState, ActivityLog as ActivityLogType } from '@/lib/types';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { LedToggleControl } from '@/components/LedToggleControl';
import { DualMotorControl } from '@/components/DualMotorControl';
import { ServoControl } from '@/components/ServoControl';
import { CameraStream } from '@/components/CameraStream';
import { ActivityLog } from '@/components/ActivityLog';
import { Cpu, AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [backendState, setBackendState] = useState<ConnectionState>('connecting');
  const [motorStatus, setMotorStatus] = useState<MotorStatus | null>(null);
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsClientRef = useRef<DashboardWebSocketClient | null>(null);

  const addLog = useCallback((type: ActivityLogType['type'], message: string) => {
    const newLog: ActivityLogType = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  useEffect(() => {
    const client = new DashboardWebSocketClient();
    wsClientRef.current = client;

    client.onConnectionChange = (state) => {
      setBackendState(state);
      if (state === 'connected') {
        addLog('system', 'Connected to FastAPI backend (/ws/dashboard)');
        setErrorMessage(null);
      } else if (state === 'disconnected') {
        addLog('system', 'Disconnected from backend. Reconnecting...');
      } else if (state === 'error') {
        addLog('error', 'WebSocket connection failed.');
      }
    };

    client.onStatusUpdate = (status) => {
      setMotorStatus(status);
    };

    client.onError = (err) => {
      setErrorMessage(err);
      addLog('error', `Server rejected: ${err}`);
    };

    client.onRawMessage = (direction, raw) => {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.type === 'status') {
          const ledStr = parsed.led_on ? 'ON' : 'OFF';
          const dirStr = parsed.direction ? parsed.direction.toUpperCase() : 'STOP';
          const servoStr = parsed.servo_angle !== undefined ? ` | Servo=${parsed.servo_angle}°` : '';
          addLog('received', `Status: LED=${ledStr} | Motor=${dirStr} (${parsed.speed}%)${servoStr} | A:${parsed.motor_a || 'OFF'} B:${parsed.motor_b || 'OFF'}`);
        } else {
          addLog(direction, raw);
        }
      } catch {
        addLog(direction, raw);
      }
    };

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [addLog]);

  // Optimistic LED State
  const [optimisticLedOn, setOptimisticLedOn] = useState<boolean | null>(null);

  const isLedOn = optimisticLedOn !== null
    ? optimisticLedOn
    : Boolean(motorStatus?.led_on || (motorStatus?.led_state && motorStatus.led_state.toUpperCase().includes('ON')));

  useEffect(() => {
    if (motorStatus) {
      const hwState = Boolean(motorStatus.led_on || (motorStatus.led_state && motorStatus.led_state.toUpperCase().includes('ON')));
      setOptimisticLedOn(hwState);
    }
  }, [motorStatus]);

  const handleToggleLed = () => {
    const nextState = !isLedOn;
    setOptimisticLedOn(nextState);

    const targetCommand: MotorCommand = {
      command: nextState ? 'turn_on' : 'turn_off'
    };

    if (wsClientRef.current) {
      wsClientRef.current.sendCommand(targetCommand);
      addLog('sent', `LED: ${targetCommand.command.toUpperCase()}`);
    }
  };

  const handleSendMotorCommand = (cmd: MotorCommand) => {
    if (wsClientRef.current) {
      wsClientRef.current.sendCommand(cmd);
      addLog('sent', `Motor: ${cmd.command.toUpperCase()}${cmd.speed !== undefined ? ` (${cmd.speed}%)` : ''}`);
    }
  };

  const handleSendServoAngle = (angle: number) => {
    if (wsClientRef.current) {
      wsClientRef.current.sendCommand({
        command: 'set_servo_angle',
        angle
      });
      addLog('sent', `Servo: SET_ANGLE (${angle}°)`);
    }
  };

  const handleReconnect = () => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
      wsClientRef.current.connect();
      addLog('system', 'Manual reconnect triggered');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                ESP32 ACTUATOR DASHBOARD
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ESP32-CAM + Dual DC + Servo + LED
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                ESP32-CAM Live Feed (10.38.152.203) &bull; L298N Dual DC Motors &bull; Servo Motor &bull; Onboard LED
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleReconnect}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${backendState === 'connecting' ? 'animate-spin' : ''}`} />
              Reconnect
            </button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-xs font-semibold text-blue-300 border border-blue-500/30 transition-colors"
            >
              FastAPI Docs ↗
            </a>
          </div>
        </header>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="text-sm font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-400 hover:text-rose-200 px-2 py-1 rounded hover:bg-rose-500/20"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Connectivity Strip */}
        <ConnectionStatus backendState={backendState} motorStatus={motorStatus} />

        {/* Section 1: Live ESP32-CAM Video Stream (7 Cols) + LED & Servo Actuators (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Live Video Feed (7 Cols) */}
          <div className="lg:col-span-7">
            <CameraStream defaultStreamUrl="http://10.38.152.203:81/stream" />
          </div>

          {/* Micro-Actuators: Onboard LED & Servo (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <LedToggleControl
              ledOn={isLedOn}
              onToggle={handleToggleLed}
              disabled={backendState !== 'connected'}
            />

            <ServoControl
              onSendAngle={handleSendServoAngle}
              status={motorStatus}
              disabled={backendState !== 'connected'}
            />
          </div>
        </div>

        {/* Section 2: Full-Width Dual Motor Controller (12 Cols) */}
        <div>
          <DualMotorControl
            onSendCommand={handleSendMotorCommand}
            status={motorStatus}
            disabled={backendState !== 'connected'}
          />
        </div>

        {/* Section 3: Activity Log Feed */}
        <ActivityLog logs={logs} onClear={() => setLogs([])} />

      </div>
    </div>
  );
}
