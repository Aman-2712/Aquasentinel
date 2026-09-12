'use client';

import React, { useState, useEffect } from 'react';
import { MotorStatus } from '@/lib/types';
import { Compass, Sliders, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface ServoControlProps {
  onSendAngle: (angle: number) => void;
  status: MotorStatus | null;
  disabled?: boolean;
}

const SERVO_PRESETS = [
  { label: '0° Min', angle: 0 },
  { label: '45°', angle: 45 },
  { label: '90° Center', angle: 90 },
  { label: '135°', angle: 135 },
  { label: '180° Max', angle: 180 },
];

export const ServoControl: React.FC<ServoControlProps> = ({
  onSendAngle,
  status,
  disabled = false,
}) => {
  const currentTelemetryAngle = status?.servo_angle ?? 90;
  const [angle, setAngle] = useState<number>(currentTelemetryAngle);

  // Sync with incoming telemetry if updated remotely
  useEffect(() => {
    if (status?.servo_angle !== undefined) {
      setAngle(status.servo_angle);
    }
  }, [status?.servo_angle]);

  const handleAngleChange = (newAngle: number) => {
    const clamped = Math.max(0, Math.min(180, newAngle));
    setAngle(clamped);
    onSendAngle(clamped);
  };

  const handleNudge = (delta: number) => {
    handleAngleChange(angle + delta);
  };

  // Convert angle (0° to 180°) into needle rotation for SVG
  // 0° points left (-90° in standard Cartesian), 90° points straight up (0°), 180° points right (+90°)
  const needleRotation = angle - 90;

  // Status label
  const angleLabel = angle === 0 ? 'MIN (0°)' : angle === 90 ? 'CENTER (90°)' : angle === 180 ? 'MAX (180°)' : `${angle}°`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            SG90 / MG996R PWM Channel
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">
            SERVO MOTOR ANGLE
          </h2>
          <p className="text-xs text-slate-400">
            Precision 0° to 180° angular position control on GPIO 18
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.2)] inline-block">
            {angle}°
          </span>
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
            {angleLabel}
          </span>
        </div>
      </div>

      {/* Interactive Protractor Dial Visualizer */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
          
          {/* Protractor Arc SVG */}
          <svg className="w-48 h-28" viewBox="0 0 200 115">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Active Angle Arc */}
            {angle > 0 && (
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#servoGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 - (angle / 180) * 251.3}
                className="transition-all duration-200 ease-out"
              />
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="servoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Tick Marks: 0°, 45°, 90°, 135°, 180° */}
            {[0, 45, 90, 135, 180].map((deg) => {
              const rad = (deg - 180) * (Math.PI / 180);
              const x1 = 100 + 68 * Math.cos(rad);
              const y1 = 100 + 68 * Math.sin(rad);
              const x2 = 100 + 78 * Math.cos(rad);
              const y2 = 100 + 78 * Math.sin(rad);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#64748b"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Rotating Servo Needle / Arm */}
          <div
            className="absolute bottom-0 w-1.5 h-20 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full origin-bottom transition-transform duration-200 ease-out shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transformOrigin: '50% 100%',
            }}
          />

          {/* Center Pivot Hub */}
          <div className="absolute bottom-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 shadow-md flex items-center justify-center transform translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        </div>

        {/* Min / Center / Max Sub-Labels */}
        <div className="w-52 flex justify-between text-[10px] font-mono text-slate-400 pt-3 px-1">
          <span>0°</span>
          <span>45°</span>
          <span className="text-amber-300 font-bold">90°</span>
          <span>135°</span>
          <span>180°</span>
        </div>
      </div>

      {/* Continuous Slider Control */}
      <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Fine Angle Slider
          </span>
          <span className="font-mono text-amber-400">{angle}°</span>
        </div>

        <input
          type="range"
          min="0"
          max="180"
          step="1"
          value={angle}
          disabled={disabled}
          onChange={(e) => handleAngleChange(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
        />

        {/* Nudge Buttons: -5°, -1°, +1°, +5° */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <button
            type="button"
            disabled={disabled || angle <= 0}
            onClick={() => handleNudge(-5)}
            className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-800 disabled:opacity-40 cursor-pointer"
          >
            -5°
          </button>
          <button
            type="button"
            disabled={disabled || angle <= 0}
            onClick={() => handleNudge(-1)}
            className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-800 disabled:opacity-40 cursor-pointer"
          >
            -1°
          </button>
          <button
            type="button"
            disabled={disabled || angle >= 180}
            onClick={() => handleNudge(1)}
            className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-800 disabled:opacity-40 cursor-pointer"
          >
            +1°
          </button>
          <button
            type="button"
            disabled={disabled || angle >= 180}
            onClick={() => handleNudge(5)}
            className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-800 disabled:opacity-40 cursor-pointer"
          >
            +5°
          </button>
        </div>
      </div>

      {/* Preset Angle Buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {SERVO_PRESETS.map((preset) => (
          <button
            key={preset.angle}
            type="button"
            disabled={disabled}
            onClick={() => handleAngleChange(preset.angle)}
            className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
              angle === preset.angle
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] font-black'
                : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border-slate-800'
            } disabled:opacity-40`}
          >
            {preset.label}
          </button>
        ))}
      </div>

    </div>
  );
};
