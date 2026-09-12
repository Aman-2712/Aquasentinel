'use client';

import React, { useState, useEffect } from 'react';
import { MotorCommand, MotorStatus } from '@/lib/types';
import { 
  Settings, 
  ArrowUp, 
  ArrowDown, 
  Square, 
  RotateCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface DualMotorControlProps {
  onSendCommand: (cmd: MotorCommand) => void;
  status: MotorStatus | null;
  disabled?: boolean;
}

export const DualMotorControl: React.FC<DualMotorControlProps> = ({
  onSendCommand,
  status,
  disabled = false,
}) => {
  // Motor A States
  const motorADir = status?.motor_a_dir || 'stop';
  const motorASpeed = status?.motor_a_speed ?? 0;
  const [rpmA, setRpmA] = useState<number>(120);

  // Motor B States
  const motorBDir = status?.motor_b_dir || 'stop';
  const motorBSpeed = status?.motor_b_speed ?? 0;
  const [rpmB, setRpmB] = useState<number>(120);

  // Sync with incoming telemetry if needed
  useEffect(() => {
    if (motorASpeed > 0) {
      setRpmA(Math.round(motorASpeed * 2.5));
    }
  }, [motorASpeed]);

  useEffect(() => {
    if (motorBSpeed > 0) {
      setRpmB(Math.round(motorBSpeed * 2.5));
    }
  }, [motorBSpeed]);

  // Convert RPM (0-255) to 0-100% PWM speed for backend
  const rpmToSpeed = (rpm: number) => Math.min(100, Math.max(10, Math.round(rpm / 2.5)));

  // Motor A Actions
  const handleMotorA = (action: 'forward' | 'backward' | 'stop') => {
    if (action === 'stop') {
      onSendCommand({ command: 'motor_a_stop' });
    } else if (action === 'forward') {
      onSendCommand({ command: 'motor_a_forward', speed: rpmToSpeed(rpmA) });
    } else if (action === 'backward') {
      onSendCommand({ command: 'motor_a_backward', speed: rpmToSpeed(rpmA) });
    }
  };

  const stepRpmA = (delta: number) => {
    const nextRpm = Math.max(0, Math.min(255, rpmA + delta));
    setRpmA(nextRpm);
    if (motorADir !== 'stop') {
      onSendCommand({ command: 'set_motor_speed', motor: 'a', speed: rpmToSpeed(nextRpm) });
    }
  };

  // Motor B Actions
  const handleMotorB = (action: 'forward' | 'backward' | 'stop') => {
    if (action === 'stop') {
      onSendCommand({ command: 'motor_b_stop' });
    } else if (action === 'forward') {
      onSendCommand({ command: 'motor_b_forward', speed: rpmToSpeed(rpmB) });
    } else if (action === 'backward') {
      onSendCommand({ command: 'motor_b_backward', speed: rpmToSpeed(rpmB) });
    }
  };

  const stepRpmB = (delta: number) => {
    const nextRpm = Math.max(0, Math.min(255, rpmB + delta));
    setRpmB(nextRpm);
    if (motorBDir !== 'stop') {
      onSendCommand({ command: 'set_motor_speed', motor: 'b', speed: rpmToSpeed(nextRpm) });
    }
  };

  return (
    <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Motor Control
          </h2>
          <p className="text-xs text-slate-400">
            Control both motors (RPM &amp; Direction)
          </p>
        </div>
      </div>

      {/* Dual Motor Side-by-Side Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        
        {/* ==================== MOTOR A ==================== */}
        <div className="bg-[#0e1933] border border-[#1a2b4e] rounded-xl p-3.5 space-y-3">
          {/* Motor Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#162a52] border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
              <RotateCw className={`w-3.5 h-3.5 ${motorADir !== 'stop' ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              Motor A
            </span>
          </div>

          {/* RPM Stepper Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">RPM</span>
            <div className="flex items-center bg-[#070e1e] border border-[#1b2c4e] rounded-lg px-2 py-1 gap-2">
              <span className="font-mono text-xs font-bold text-white w-10 text-center">
                {rpmA}
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => stepRpmA(5)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => stepRpmA(-5)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Direction Label */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">Direction</span>
            {/* Direction Buttons Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleMotorA('forward')}
                className={`py-2 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                  motorADir === 'forward'
                    ? 'bg-[#10b981] text-white shadow-md shadow-emerald-500/30'
                    : 'bg-[#10b981] hover:bg-[#059669] text-white'
                }`}
                title="Forward"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleMotorA('backward')}
                className={`py-2 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                  motorADir === 'backward'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-[#1a2948] hover:bg-[#253961] text-slate-300'
                }`}
                title="Backward / Reverse"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-width Stop Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleMotorA('stop')}
            className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Square className="w-3 h-3 fill-white" />
            <span>Stop</span>
          </button>
        </div>

        {/* ==================== MOTOR B ==================== */}
        <div className="bg-[#0e1933] border border-[#1a2b4e] rounded-xl p-3.5 space-y-3">
          {/* Motor Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#162a52] border border-[#00d2ff]/30 flex items-center justify-center text-[#00d2ff]">
              <RotateCw className={`w-3.5 h-3.5 ${motorBDir !== 'stop' ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-xs font-bold text-white tracking-wide">
              Motor B
            </span>
          </div>

          {/* RPM Stepper Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">RPM</span>
            <div className="flex items-center bg-[#070e1e] border border-[#1b2c4e] rounded-lg px-2 py-1 gap-2">
              <span className="font-mono text-xs font-bold text-white w-10 text-center">
                {rpmB}
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => stepRpmB(5)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => stepRpmB(-5)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Direction Label */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium">Direction</span>
            {/* Direction Buttons Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleMotorB('forward')}
                className={`py-2 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                  motorBDir === 'forward'
                    ? 'bg-[#10b981] text-white shadow-md shadow-emerald-500/30'
                    : 'bg-[#10b981] hover:bg-[#059669] text-white'
                }`}
                title="Forward"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleMotorB('backward')}
                className={`py-2 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                  motorBDir === 'backward'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-[#1a2948] hover:bg-[#253961] text-slate-300'
                }`}
                title="Backward / Reverse"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full-width Stop Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleMotorB('stop')}
            className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Square className="w-3 h-3 fill-white" />
            <span>Stop</span>
          </button>
        </div>

      </div>
    </div>
  );
};
