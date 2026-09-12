'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Cpu, Calendar, User, ChevronDown } from 'lucide-react';
import { ConnectionState, MotorStatus } from '@/lib/types';

interface TopHeaderProps {
  backendState: ConnectionState;
  motorStatus: MotorStatus | null;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  backendState,
  motorStatus,
}) => {
  const [formattedTime, setFormattedTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format like: "27 Aug 2025 | 14:32"
      const day = now.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      setFormattedTime(`${day} ${month} ${year}  |  ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isBackendConnected = backendState === 'connected';
  const isEspConnected = Boolean(motorStatus?.connected);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-2">
      {/* 3 Status Info Cards */}
      <div className="flex flex-wrap items-center gap-3.5 flex-1">
        
        {/* Backend Connection Card */}
        <div className="bg-[#0b1428] border border-[#162544] rounded-2xl px-4 py-3 flex items-center gap-3.5 min-w-[200px] shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              Backend Connection
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`} />
              <span className={`text-xs font-semibold ${isBackendConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBackendConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* ESP Connection Card */}
        <div className="bg-[#0b1428] border border-[#162544] rounded-2xl px-4 py-3 flex items-center gap-3.5 min-w-[200px] shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              ESP Connection
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isEspConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'}`} />
              <span className={`text-xs font-semibold ${isEspConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEspConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Time Date Card */}
        <div className="bg-[#0b1428] border border-[#162544] rounded-2xl px-4 py-3 flex items-center gap-3.5 min-w-[210px] shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              Time Date
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5 font-mono">
              {formattedTime || '27 Aug 2025 | 14:32'}
            </div>
          </div>
        </div>

      </div>

      {/* User Profile Pill (Far Right) */}
      <div className="bg-[#0b1428] border border-[#162544] rounded-full px-3.5 py-2 flex items-center gap-3 shadow-lg hover:border-[#1e3460] transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-[#1d64f2] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <User className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-slate-200">
          AquaSentinel
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </header>
  );
};
