'use client';

import React, { useState, useEffect } from 'react';
import { MotorStatus } from '@/lib/types';
import { Gauge, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServoControlProps {
  onSendAngle: (angle: number) => void;
  status: MotorStatus | null;
  disabled?: boolean;
}

export const ServoControl: React.FC<ServoControlProps> = ({
  onSendAngle,
  status,
  disabled = false,
}) => {
  const currentTelemetryAngle = status?.servo_angle ?? 90;
  const [angle, setAngle] = useState<number>(currentTelemetryAngle);

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

  const handleStep = (delta: number) => {
    handleAngleChange(angle + delta);
  };

  // Convert 0° - 180° into needle rotation in degrees:
  // 0° points left (-90 deg from vertical), 90° straight up (0 deg), 180° points right (+90 deg)
  const needleRotation = angle - 90;

  return (
    <div className="bg-[#0b1428] border border-[#162544] rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
          <Gauge className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Servo Motor Control
          </h2>
          <p className="text-xs text-slate-400">
            Adjust the angle of the servo motor
          </p>
        </div>
      </div>

      {/* Radial Semi-Circle Gauge Visualizer */}
      <div className="relative flex flex-col items-center justify-center pt-2">
        <div className="relative w-64 h-32 flex items-end justify-center overflow-hidden">
          
          {/* Radial Arc SVG with Gradient */}
          <svg className="w-64 h-32" viewBox="0 0 240 125">
            <defs>
              <linearGradient id="servoCyanGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="50%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Background Track Arc */}
            <path
              d="M 25 115 A 95 95 0 0 1 215 115"
              fill="none"
              stroke="#13223f"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Active Arc Gradient */}
            <path
              d="M 25 115 A 95 95 0 0 1 215 115"
              fill="none"
              stroke="url(#servoCyanGreen)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="298.45"
              strokeDashoffset={298.45 - (angle / 180) * 298.45}
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Sleek White Needle Pointer */}
          <div
            className="absolute bottom-0 w-1 h-20 bg-white rounded-full origin-bottom transition-transform duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            style={{
              transform: `rotate(${needleRotation}deg)`,
              transformOrigin: '50% 100%',
            }}
          />

          {/* Pivot Hub */}
          <div className="absolute bottom-0 w-5 h-5 rounded-full bg-white shadow-md transform translate-y-1/2" />
        </div>

        {/* 0° and 180° Labels + Big Center Angle */}
        <div className="w-64 flex justify-between items-center text-xs text-slate-400 px-1 pt-1 font-medium">
          <span>0°</span>
          <span className="text-2xl font-black text-white tracking-tight -translate-y-2">
            {angle}°
          </span>
          <span>180°</span>
        </div>
      </div>

      {/* Stepper Buttons & Value Display (< 90° >) */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {/* Decrease Button */}
        <button
          type="button"
          disabled={disabled || angle <= 0}
          onClick={() => handleStep(-10)}
          className="bg-[#101b35] hover:bg-[#162548] text-slate-300 hover:text-white border border-[#1c2c4e] rounded-xl px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Center Angle Display Box */}
        <div className="bg-[#101b35] border border-[#1c2c4e] text-white font-bold text-sm px-8 py-2.5 rounded-xl min-w-[90px] text-center font-mono">
          {angle}°
        </div>

        {/* Increase Button */}
        <button
          type="button"
          disabled={disabled || angle >= 180}
          onClick={() => handleStep(10)}
          className="bg-[#101b35] hover:bg-[#162548] text-slate-300 hover:text-white border border-[#1c2c4e] rounded-xl px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
