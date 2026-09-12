'use client';

import React from 'react';
import { Power, Lightbulb } from 'lucide-react';

interface LedToggleControlProps {
  ledOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const LedToggleControl: React.FC<LedToggleControlProps> = ({
  ledOn,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center text-center space-y-8 max-w-xl mx-auto">
      
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          ESP32 Onboard LED (GPIO 2)
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          LED POWER CONTROL
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Click the button below to toggle the physical ESP32 onboard LED in real time.
        </p>
      </div>

      {/* Big Glowing Hardware Status Visualizer */}
      <div className="relative">
        <div
          className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
            ledOn
              ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-[0_0_80px_rgba(59,130,246,0.8)] scale-105'
              : 'bg-slate-950 border-4 border-slate-800 text-slate-600 shadow-inner'
          }`}
        >
          <Lightbulb className={`w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-300 ${ledOn ? 'scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]' : 'scale-95 opacity-40'}`} />
        </div>

        {/* Pulse ring when ON */}
        {ledOn && (
          <div className="absolute inset-0 rounded-full border-4 border-blue-400/40 animate-ping pointer-events-none" />
        )}
      </div>

      {/* State Text */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className={`w-3 h-3 rounded-full ${ledOn ? 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,1)] animate-pulse' : 'bg-slate-700'}`} />
          <span className={`text-2xl sm:text-3xl font-mono font-black tracking-wider ${ledOn ? 'text-blue-400' : 'text-slate-500'}`}>
            {ledOn ? 'LED IS ON' : 'LED IS OFF'}
          </span>
        </div>
        <p className="text-xs font-mono text-slate-400">
          Hardware Pin: GPIO 2 = {ledOn ? 'HIGH (3.3V)' : 'LOW (0V)'}
        </p>
      </div>

      {/* The Single Master Toggle Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`group relative w-full sm:w-80 py-5 px-8 rounded-2xl font-black text-lg sm:text-xl tracking-widest flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl active:scale-95 border cursor-pointer select-none ${
          disabled
            ? 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed'
            : ledOn
            ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-[0_0_30px_rgba(225,29,72,0.4)]'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/40 shadow-[0_0_35px_rgba(37,99,235,0.5)]'
        }`}
      >
        <Power className={`w-6 h-6 transition-transform duration-300 ${ledOn ? 'rotate-180' : 'group-hover:scale-110'}`} />
        <span>{ledOn ? 'TURN OFF LED' : 'TURN ON LED'}</span>
      </button>

      {disabled && (
        <p className="text-xs text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Waiting for backend connection...
        </p>
      )}

    </div>
  );
};
