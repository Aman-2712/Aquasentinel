'use client';

import React from 'react';
import { MotorStatus } from '@/lib/types';
import { RotateCw, RotateCcw, AlertOctagon, Lightbulb, Zap, Gauge } from 'lucide-react';

interface MotorStatusCardProps {
  status: MotorStatus | null;
}

export const MotorStatusCard: React.FC<MotorStatusCardProps> = ({ status }) => {
  const direction = status?.direction || 'stop';
  const speed = status?.speed ?? 0;
  const isEmergencyStop = Boolean(status?.emergency_stop);
  const isRunning = direction !== 'stop' && speed > 0 && !isEmergencyStop;

  // LED state calculation
  const ledDescription = status?.led_state || (
    isEmergencyStop ? 'EMERGENCY HALT (OFF)' :
    isRunning ? (direction === 'forward' ? `SOLID ON (${speed}% PWM)` : `PULSING/BREATHING (${speed}% PWM)`) :
    'OFF'
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-amber-400" />
            ACTUATOR TELEMETRY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time ESP32 hardware & PWM state</p>
        </div>

        {isEmergencyStop ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <AlertOctagon className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">E-STOP ACTIVE</span>
          </div>
        ) : isRunning ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wider">RUNNING</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <span className="text-xs font-bold tracking-wider">STOPPED</span>
          </div>
        )}
      </div>

      {/* Main Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Tachometer / Speed Radial Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Progress Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`transition-all duration-300 ease-out ${
                  isEmergencyStop ? 'stroke-rose-500' :
                  direction === 'forward' ? 'stroke-emerald-400' :
                  direction === 'reverse' ? 'stroke-cyan-400' : 'stroke-slate-700'
                }`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (isEmergencyStop ? 0 : speed)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                {isEmergencyStop ? '0' : speed}
                <span className="text-lg text-slate-400 font-normal">%</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PWM DUTY</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-2 font-mono">
            Output: {Math.round(((isEmergencyStop ? 0 : speed) * 255) / 100)} / 255
          </span>
        </div>

        {/* Direction & Motion Status */}
        <div className="space-y-4">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Active Direction
            </span>
            <div className="flex items-center space-x-3">
              {direction === 'forward' && isRunning ? (
                <>
                  <RotateCw className="w-7 h-7 text-emerald-400 animate-spin" style={{ animationDuration: `${Math.max(0.5, 3 - (speed / 40))}s` }} />
                  <div>
                    <span className="text-lg font-black text-emerald-400 tracking-wider">FORWARD</span>
                    <p className="text-[11px] text-slate-400">Clockwise / Steady Output</p>
                  </div>
                </>
              ) : direction === 'reverse' && isRunning ? (
                <>
                  <RotateCcw className="w-7 h-7 text-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: `${Math.max(0.5, 3 - (speed / 40))}s` }} />
                  <div>
                    <span className="text-lg font-black text-cyan-400 tracking-wider">REVERSE</span>
                    <p className="text-[11px] text-slate-400">Counter-Clockwise / Pulse Mode</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs">
                    --
                  </div>
                  <div>
                    <span className="text-lg font-bold text-slate-400 tracking-wider">STOP / IDLE</span>
                    <p className="text-[11px] text-slate-500">Zero RPM / Standby</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Emergency Stop State
            </span>
            <span className={`text-base font-bold font-mono ${isEmergencyStop ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isEmergencyStop ? '● ACTIVE (SYSTEM LOCKED)' : '○ DISENGAGED (NORMAL)'}
            </span>
          </div>
        </div>

        {/* Onboard LED Actuator State Card */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            ESP32 Onboard LED (GPIO 2)
          </div>

          {/* LED Glowing simulation circle */}
          <div className="relative my-2">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                isEmergencyStop
                  ? 'bg-rose-900/40 text-rose-500 border border-rose-600/50'
                  : isRunning
                  ? direction === 'forward'
                    ? 'bg-blue-600 text-white shadow-[0_0_24px_rgba(59,130,246,0.9)]'
                    : 'bg-cyan-500 text-white shadow-[0_0_24px_rgba(6,182,212,0.9)] animate-pulse'
                  : 'bg-slate-800 text-slate-600 border border-slate-700'
              }`}
              style={{
                opacity: isRunning ? Math.max(0.3, speed / 100) : 1
              }}
            >
              <Lightbulb className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-1 font-mono text-sm font-semibold text-slate-200">
            {ledDescription}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            Hardware PWM dimming & mode indicator
          </span>
        </div>
      </div>
    </div>
  );
};
