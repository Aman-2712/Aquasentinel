'use client';

import React, { useState, useEffect } from 'react';
import { MotorCommand, MotorStatus } from '@/lib/types';
import { 
  ArrowUp, ArrowDown, Square, AlertTriangle, 
  ShieldAlert, Cpu, RotateCw, RotateCcw, Gauge
} from 'lucide-react';

interface DualMotorControlProps {
  onSendCommand: (cmd: MotorCommand) => void;
  status: MotorStatus | null;
  disabled?: boolean;
}

const RPM_PRESETS = [
  { label: '60 RPM', rpm: 60, speed: 25 },
  { label: '125 RPM', rpm: 125, speed: 50 },
  { label: '190 RPM', rpm: 190, speed: 75 },
  { label: '250 RPM', rpm: 250, speed: 100 },
];

export const DualMotorControl: React.FC<DualMotorControlProps> = ({
  onSendCommand,
  status,
  disabled = false
}) => {
  const isEmergencyStop = Boolean(status?.emergency_stop);

  // Motor A States
  const motorADir = status?.motor_a_dir || 'stop';
  const motorASpeed = status?.motor_a_speed ?? 0;
  const [speedA, setSpeedA] = useState<number>(motorASpeed > 0 ? motorASpeed : 75);

  // Motor B States
  const motorBDir = status?.motor_b_dir || 'stop';
  const motorBSpeed = status?.motor_b_speed ?? 0;
  const [speedB, setSpeedB] = useState<number>(motorBSpeed > 0 ? motorBSpeed : 75);

  // Sync with incoming telemetry
  useEffect(() => {
    if (motorASpeed > 0) setSpeedA(motorASpeed);
  }, [motorASpeed]);

  useEffect(() => {
    if (motorBSpeed > 0) setSpeedB(motorBSpeed);
  }, [motorBSpeed]);

  // Derived RPM (assuming standard ~250 RPM peak hobby motor at 100% PWM)
  const rpmA = Math.round(speedA * 2.5);
  const rpmB = Math.round(speedB * 2.5);

  // Spin animation speeds in seconds based on RPM
  const spinDurationA = `${Math.max(0.25, 2.0 - (speedA / 100) * 1.6).toFixed(2)}s`;
  const spinDurationB = `${Math.max(0.25, 2.0 - (speedB / 100) * 1.6).toFixed(2)}s`;

  // Motor A Handlers
  const handleMotorA = (action: 'forward' | 'backward' | 'stop') => {
    if (action === 'stop') {
      onSendCommand({ command: 'motor_a_stop' });
    } else if (action === 'forward') {
      onSendCommand({ command: 'motor_a_forward', speed: speedA });
    } else if (action === 'backward') {
      onSendCommand({ command: 'motor_a_backward', speed: speedA });
    }
  };

  const handleSpeedChangeA = (newSpeed: number) => {
    setSpeedA(newSpeed);
    onSendCommand({ command: 'set_motor_speed', motor: 'a', speed: newSpeed });
  };

  // Motor B Handlers
  const handleMotorB = (action: 'forward' | 'backward' | 'stop') => {
    if (action === 'stop') {
      onSendCommand({ command: 'motor_b_stop' });
    } else if (action === 'forward') {
      onSendCommand({ command: 'motor_b_forward', speed: speedB });
    } else if (action === 'backward') {
      onSendCommand({ command: 'motor_b_backward', speed: speedB });
    }
  };

  const handleSpeedChangeB = (newSpeed: number) => {
    setSpeedB(newSpeed);
    onSendCommand({ command: 'set_motor_speed', motor: 'b', speed: newSpeed });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            L298N Dual H-Bridge Driver
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            INDEPENDENT DUAL MOTOR CONTROLLER
          </h2>
          <p className="text-xs text-slate-400">
            Each motor is independently controlled Forward &amp; Backward with dedicated RPM speed
          </p>
        </div>

        {isEmergencyStop && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            E-STOP ENGAGED
          </div>
        )}
      </div>

      {/* Two Independent Motor Channels (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ==================== MOTOR A CHANNEL ==================== */}
        <div className={`bg-slate-950/80 border rounded-2xl p-5 space-y-5 flex flex-col justify-between transition-all ${
          motorADir !== 'stop' ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-slate-800/90'
        }`}>
          <div>
            {/* Title & Direction Telemetry Badge */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  motorADir === 'forward' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                  motorADir === 'backward' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {motorADir === 'backward' ? (
                    <RotateCcw 
                      className="w-5 h-5 animate-spin" 
                      style={{ animationDirection: 'reverse', animationDuration: spinDurationA }} 
                    />
                  ) : (
                    <RotateCw 
                      className={`w-5 h-5 ${motorADir === 'forward' ? 'animate-spin' : ''}`} 
                      style={{ animationDuration: spinDurationA }} 
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-wide flex items-center gap-1.5">
                    MOTOR A
                    <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      CH 1
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">ENA:14 &bull; IN1:26 &bull; IN2:27</span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase border inline-block ${
                  motorADir === 'forward' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                  motorADir === 'backward' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]' :
                  'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}>
                  {motorADir === 'forward' ? '▲ FORWARD' : motorADir === 'backward' ? '▼ BACKWARD' : '■ STOPPED'}
                </span>
              </div>
            </div>

            {/* RPM Speed Selection Panel */}
            <div className="mt-4 space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  Target RPM &amp; Speed
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {rpmA} RPM
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {speedA}% PWM
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={speedA}
                disabled={disabled || isEmergencyStop}
                onChange={(e) => handleSpeedChangeA(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
              />

              {/* RPM Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {RPM_PRESETS.map((preset) => (
                  <button
                    key={preset.speed}
                    type="button"
                    disabled={disabled || isEmergencyStop}
                    onClick={() => handleSpeedChangeA(preset.speed)}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      speedA === preset.speed
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    } disabled:opacity-40`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons: FORWARD, BACKWARD, STOP */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Forward Button */}
              <button
                type="button"
                disabled={disabled || isEmergencyStop}
                onClick={() => handleMotorA('forward')}
                className={`py-3.5 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                  motorADir === 'forward' && !isEmergencyStop
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-emerald-300 border-slate-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>FORWARD</span>
              </button>

              {/* Backward Button */}
              <button
                type="button"
                disabled={disabled || isEmergencyStop}
                onClick={() => handleMotorA('backward')}
                className={`py-3.5 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                  motorADir === 'backward' && !isEmergencyStop
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/50'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 border-slate-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ArrowDown className="w-4 h-4" />
                <span>BACKWARD</span>
              </button>
            </div>

            {/* Individual Motor A Stop */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleMotorA('stop')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                motorADir === 'stop' && !isEmergencyStop
                  ? 'bg-slate-800 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-amber-600/20 hover:text-amber-300 border-slate-700'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP MOTOR A</span>
            </button>
          </div>
        </div>


        {/* ==================== MOTOR B CHANNEL ==================== */}
        <div className={`bg-slate-950/80 border rounded-2xl p-5 space-y-5 flex flex-col justify-between transition-all ${
          motorBDir !== 'stop' ? 'border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.15)]' : 'border-slate-800/90'
        }`}>
          <div>
            {/* Title & Direction Telemetry Badge */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  motorBDir === 'forward' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                  motorBDir === 'backward' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {motorBDir === 'backward' ? (
                    <RotateCcw 
                      className="w-5 h-5 animate-spin" 
                      style={{ animationDirection: 'reverse', animationDuration: spinDurationB }} 
                    />
                  ) : (
                    <RotateCw 
                      className={`w-5 h-5 ${motorBDir === 'forward' ? 'animate-spin' : ''}`} 
                      style={{ animationDuration: spinDurationB }} 
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-wide flex items-center gap-1.5">
                    MOTOR B
                    <span className="text-[10px] font-mono font-normal text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                      CH 2
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">ENB:13 &bull; IN3:32 &bull; IN4:33</span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase border inline-block ${
                  motorBDir === 'forward' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                  motorBDir === 'backward' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]' :
                  'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}>
                  {motorBDir === 'forward' ? '▲ FORWARD' : motorBDir === 'backward' ? '▼ BACKWARD' : '■ STOPPED'}
                </span>
              </div>
            </div>

            {/* RPM Speed Selection Panel */}
            <div className="mt-4 space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  Target RPM &amp; Speed
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                    {rpmB} RPM
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {speedB}% PWM
                  </span>
                </div>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={speedB}
                disabled={disabled || isEmergencyStop}
                onChange={(e) => handleSpeedChangeB(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
              />

              {/* RPM Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {RPM_PRESETS.map((preset) => (
                  <button
                    key={preset.speed}
                    type="button"
                    disabled={disabled || isEmergencyStop}
                    onClick={() => handleSpeedChangeB(preset.speed)}
                    className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      speedB === preset.speed
                        ? 'bg-sky-600 text-white border-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.4)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    } disabled:opacity-40`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons: FORWARD, BACKWARD, STOP */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Forward Button */}
              <button
                type="button"
                disabled={disabled || isEmergencyStop}
                onClick={() => handleMotorB('forward')}
                className={`py-3.5 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                  motorBDir === 'forward' && !isEmergencyStop
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-emerald-300 border-slate-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>FORWARD</span>
              </button>

              {/* Backward Button */}
              <button
                type="button"
                disabled={disabled || isEmergencyStop}
                onClick={() => handleMotorB('backward')}
                className={`py-3.5 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                  motorBDir === 'backward' && !isEmergencyStop
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/50'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 border-slate-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ArrowDown className="w-4 h-4" />
                <span>BACKWARD</span>
              </button>
            </div>

            {/* Individual Motor B Stop */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleMotorB('stop')}
              className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                motorBDir === 'stop' && !isEmergencyStop
                  ? 'bg-slate-800 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-amber-600/20 hover:text-amber-300 border-slate-700'
              }`}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP MOTOR B</span>
            </button>
          </div>
        </div>

      </div>

      {/* Global Safety Controls: STOP BOTH MOTORS & EMERGENCY STOP */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSendCommand({ command: 'stop' })}
          className="py-4 px-6 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 uppercase shadow-md active:scale-98 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer transition-all"
        >
          <Square className="w-4 h-4 fill-current" />
          STOP BOTH MOTORS
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSendCommand({ command: 'emergency_stop' })}
          className={`py-4 px-6 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 uppercase shadow-xl active:scale-98 border cursor-pointer transition-all ${
            isEmergencyStop
              ? 'bg-rose-700 text-white border-rose-500 shadow-[0_0_24px_rgba(225,29,72,0.8)] animate-pulse'
              : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/80 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          EMERGENCY STOP
        </button>
      </div>

    </div>
  );
};
