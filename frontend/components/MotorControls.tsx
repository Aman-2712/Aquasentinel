'use client';

import React, { useState, useEffect } from 'react';
import { MotorCommand } from '@/lib/types';
import { ArrowRightCircle, ArrowLeftCircle, Square, AlertTriangle, Sliders, ShieldAlert } from 'lucide-react';

interface MotorControlsProps {
  onSendCommand: (cmd: MotorCommand) => void;
  currentSpeed: number;
  currentDirection: string;
  isEmergencyStop: boolean;
  disabled?: boolean;
}

export const MotorControls: React.FC<MotorControlsProps> = ({
  onSendCommand,
  currentSpeed,
  currentDirection,
  isEmergencyStop,
  disabled = false
}) => {
  const [sliderSpeed, setSliderSpeed] = useState<number>(currentSpeed || 50);

  useEffect(() => {
    if (currentSpeed !== undefined) {
      setSliderSpeed(currentSpeed);
    }
  }, [currentSpeed]);

  const handleSpeedChange = (newSpeed: number) => {
    setSliderSpeed(newSpeed);
    onSendCommand({ command: 'set_speed', speed: newSpeed });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            OPERATOR CONTROL PANEL
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Dispatches validated real-time commands</p>
        </div>
        {isEmergencyStop && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            RESET WITH &quot;STOP&quot;
          </div>
        )}
      </div>

      {/* Speed Slider Section */}
      <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="speed-slider" className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            Target Speed / PWM Output
          </label>
          <span className="text-xl font-bold font-mono text-white bg-slate-800/90 px-3 py-0.5 rounded border border-slate-700">
            {sliderSpeed}%
          </span>
        </div>

        <div className="relative pt-2 pb-1">
          <input
            id="speed-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={sliderSpeed}
            disabled={disabled || isEmergencyStop}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
            <span>0% (OFF)</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% (MAX)</span>
          </div>
        </div>

        {/* Quick Speed Preset Buttons */}
        <div className="flex gap-2 pt-1">
          {[0, 25, 50, 75, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={disabled || isEmergencyStop}
              onClick={() => handleSpeedChange(preset)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-colors border ${
                sliderSpeed === preset
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Primary Direction & Stop Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Forward Button */}
        <button
          type="button"
          disabled={disabled || isEmergencyStop}
          onClick={() => onSendCommand({ command: 'forward' })}
          className={`py-4 px-4 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 border ${
            currentDirection === 'forward' && !isEmergencyStop
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
              : 'bg-slate-800 text-slate-100 hover:bg-emerald-700/80 hover:text-white border-slate-700'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ArrowRightCircle className="w-5 h-5" />
          FORWARD
        </button>

        {/* Reverse Button */}
        <button
          type="button"
          disabled={disabled || isEmergencyStop}
          onClick={() => onSendCommand({ command: 'reverse' })}
          className={`py-4 px-4 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 border ${
            currentDirection === 'reverse' && !isEmergencyStop
              ? 'bg-cyan-600 text-white border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.4)]'
              : 'bg-slate-800 text-slate-100 hover:bg-cyan-700/80 hover:text-white border-slate-700'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ArrowLeftCircle className="w-5 h-5" />
          REVERSE
        </button>

        {/* Normal Stop Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSendCommand({ command: 'stop' })}
          className="py-4 px-4 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 bg-slate-800 text-slate-200 hover:bg-amber-600 hover:text-white border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Square className="w-5 h-5" />
          STOP
        </button>
      </div>

      {/* Emergency Stop Button (Large, prominent red button) */}
      <div className="pt-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSendCommand({ command: 'emergency_stop' })}
          className={`w-full py-5 px-6 rounded-2xl font-black text-lg sm:text-xl tracking-widest flex items-center justify-center gap-3 transition-all duration-150 uppercase shadow-2xl active:scale-98 border-2 ${
            isEmergencyStop
              ? 'bg-rose-700 text-white border-rose-500 shadow-[0_0_28px_rgba(225,29,72,0.8)] animate-pulse'
              : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/80 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
          }`}
        >
          <AlertTriangle className="w-7 h-7 animate-bounce" />
          EMERGENCY STOP
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Immediate zero-PWM cutoff. Overrides all active operations.
        </p>
      </div>
    </div>
  );
};
