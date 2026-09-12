'use client';

import React from 'react';
import { ConnectionState, MotorStatus } from '@/lib/types';
import { Wifi, Cpu, Server, Activity } from 'lucide-react';

interface ConnectionStatusProps {
  backendState: ConnectionState;
  motorStatus: MotorStatus | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  backendState,
  motorStatus
}) => {
  const isBackendConnected = backendState === 'connected';
  const isEsp32Connected = Boolean(motorStatus?.connected);
  const isSimulated = Boolean(motorStatus?.simulation_mode);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Backend Connection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isBackendConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">FastAPI Backend</div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-sm font-semibold text-slate-100">
                {isBackendConnected ? 'CONNECTED' : backendState === 'connecting' ? 'CONNECTING...' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ESP32 Hardware Connection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isEsp32Connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">ESP32 Actuator</div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isEsp32Connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-sm font-semibold text-slate-100">
                {isEsp32Connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </div>
        {isSimulated && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            SIMULATION
          </span>
        )}
      </div>

      {/* Device ID */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Device ID</div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">
              {motorStatus?.device || 'esp32-motor-01'}
            </div>
          </div>
        </div>
      </div>

      {/* Heartbeat Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Heartbeat / Telemetry</div>
            <div className="text-xs font-medium text-slate-300 mt-0.5">
              {motorStatus?.last_heartbeat 
                ? new Date(motorStatus.last_heartbeat).toLocaleTimeString() 
                : isBackendConnected ? 'Active (1 Hz)' : 'Waiting...'}
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {motorStatus?.connected_dashboards || 1} client(s)
        </span>
      </div>
    </div>
  );
};
