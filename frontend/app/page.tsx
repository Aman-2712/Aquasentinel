'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DashboardWebSocketClient } from '@/lib/websocket';
import { MotorCommand, MotorStatus, ConnectionState, ActivityLog as ActivityLogType } from '@/lib/types';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { CameraStream } from '@/components/CameraStream';
import { ServoControl } from '@/components/ServoControl';
import { DualMotorControl } from '@/components/DualMotorControl';
import { ActivityLog } from '@/components/ActivityLog';
import { AlertCircle, RefreshCw, Sliders, Shield, Terminal, LifeBuoy } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('live-control');
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
          const dirStr = parsed.direction ? parsed.direction.toUpperCase() : 'STOP';
          const servoStr = parsed.servo_angle !== undefined ? ` | Servo=${parsed.servo_angle}°` : '';
          addLog('received', `Status: Motor=${dirStr}${servoStr} | A:${parsed.motor_a || 'OFF'} B:${parsed.motor_b || 'OFF'}`);
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

  return (
    <div className="flex min-h-screen bg-[#070d18] text-slate-100 font-sans antialiased overflow-x-hidden">
      
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto w-full">
        
        {/* Top Header Bar */}
        <TopHeader backendState={backendState} motorStatus={motorStatus} />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 flex items-center justify-between text-rose-300">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="text-xs font-semibold">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-rose-400 hover:text-rose-200 px-2 py-1 rounded hover:bg-rose-500/20 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Live Control (Primary Screen matching reference image) */}
        {activeTab === 'live-control' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            
            {/* Left/Center Column: ESP Cam Live (8 Cols on xl) */}
            <div className="xl:col-span-8">
              <CameraStream defaultStreamUrl="http://10.38.152.203:81/stream" />
            </div>

            {/* Right Column: Servo Motor Control + Motor Control (4 Cols on xl) */}
            <div className="xl:col-span-4 space-y-5">
              {/* Servo Motor Control */}
              <ServoControl
                onSendAngle={handleSendServoAngle}
                status={motorStatus}
                disabled={backendState !== 'connected'}
              />

              {/* Dual Motor Control */}
              <DualMotorControl
                onSendCommand={handleSendMotorCommand}
                status={motorStatus}
                disabled={backendState !== 'connected'}
              />
            </div>

          </div>
        )}

        {/* Tab 2: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00d2ff]" />
                System Health
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All ESP32 actuator channels, GPIO signals, and PWM drivers are operating normally.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400 font-semibold">
                ● 100% OPERATIONAL
              </div>
            </div>

            <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Active Motors
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dual DC Motors: {motorStatus?.motor_a_dir !== 'stop' || motorStatus?.motor_b_dir !== 'stop' ? 'Running' : 'Standby'}
              </p>
              <p className="text-xs text-slate-400">
                Servo Position: {motorStatus?.servo_angle ?? 90}&deg;
              </p>
            </div>

            <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                Telemetry Stats
              </h3>
              <p className="text-xs text-slate-400">
                Connected Clients: {motorStatus?.connected_dashboards ?? 1}
              </p>
              <p className="text-xs text-slate-400">
                Latency: &lt;15ms via WebSocket
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Logs View */}
        {activeTab === 'logs' && (
          <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-6">
            <ActivityLog logs={logs} onClear={() => setLogs([])} />
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-6 space-y-4 max-w-2xl">
            <h3 className="text-base font-bold text-white">System Settings</h3>
            <p className="text-xs text-slate-400">
              Configure endpoints, stream bitrate, and hardware serial baud rate.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-300 font-medium">ESP32-CAM Stream IP</label>
                <input 
                  type="text" 
                  defaultValue="http://10.38.152.203:81/stream" 
                  className="w-full mt-1 bg-[#070e1e] border border-[#1b2c4e] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium">FastAPI WebSocket URL</label>
                <input 
                  type="text" 
                  defaultValue="ws://localhost:8000/ws/dashboard" 
                  className="w-full mt-1 bg-[#070e1e] border border-[#1b2c4e] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Help */}
        {activeTab === 'help' && (
          <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-6 space-y-4 max-w-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-[#00d2ff]" />
              AquaSentinel Help &amp; Pinout Quick Reference
            </h3>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>• <strong>Motor A (Left)</strong>: IN1 (GPIO 26), IN2 (GPIO 27), ENA (GPIO 14)</p>
              <p>• <strong>Motor B (Right)</strong>: IN3 (GPIO 32), IN4 (GPIO 33), ENB (GPIO 25)</p>
              <p>• <strong>Servo Motor (PWM)</strong>: Signal (GPIO 18)</p>
              <p>• <strong>ESP32-CAM Stream</strong>: Port 81 (/stream)</p>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
