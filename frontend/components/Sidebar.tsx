'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Settings, 
  ClipboardList, 
  HelpCircle 
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'live-control',
  onTabChange = () => {}
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-control', label: 'Live Control', icon: Camera },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs', icon: ClipboardList },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#080e1d] border-r border-[#141f36] flex flex-col justify-between p-5 select-none shrink-0 min-h-screen">
      {/* Top Logo Section */}
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Outer glowing rings */}
            <div className="w-10 h-10 rounded-full bg-[#0a2540] border border-[#00d2ff]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.25)]">
              {/* Water drop graphic */}
              <svg 
                className="w-5 h-5 text-[#00d2ff]" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white flex items-center">
              <span>Aqua</span>
              <span className="text-[#00d2ff]">Sentinel</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Detect &bull; Alert &bull; Protect
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1d64f2] text-white shadow-[0_4px_16px_rgba(29,100,242,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e1933]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Wave & Mission Tagline */}
      <div className="pt-6 space-y-2">
        {/* Dynamic Blue Wave SVG */}
        <svg 
          className="w-20 h-6 text-[#00d2ff]/70" 
          viewBox="0 0 100 25" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0 15 C 20 5, 40 25, 60 15 C 80 5, 95 20, 100 12" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          <path 
            d="M0 20 C 25 12, 45 28, 70 18 C 85 12, 95 22, 100 18" 
            stroke="#1d64f2" 
            strokeWidth="2" 
            strokeLinecap="round" 
            opacity="0.6"
          />
        </svg>
        <p className="text-[11px] text-slate-400/90 font-medium leading-relaxed">
          Smarter Monitoring<br />for a Safer Tomorrow
        </p>
      </div>
    </aside>
  );
};
