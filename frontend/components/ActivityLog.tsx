'use client';

import React from 'react';
import { ActivityLog as ActivityLogType } from '@/lib/types';
import { Terminal, Trash2 } from 'lucide-react';

interface ActivityLogProps {
  logs: ActivityLogType[];
  onClear: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col h-72">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">WebSocket Activity Feed</span>
        </div>
        <button
          onClick={onClear}
          type="button"
          title="Clear console"
          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs pr-1 select-text scrollbar-thin scrollbar-thumb-slate-700">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic text-center py-10">No communication logs recorded yet...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
              <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">{log.timestamp}</span>
              <span
                className={`px-1 rounded text-[10px] uppercase font-bold shrink-0 ${
                  log.type === 'sent'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : log.type === 'received'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : log.type === 'error'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {log.type}
              </span>
              <span
                className={`break-all ${
                  log.type === 'error'
                    ? 'text-rose-400'
                    : log.type === 'sent'
                    ? 'text-blue-200'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
