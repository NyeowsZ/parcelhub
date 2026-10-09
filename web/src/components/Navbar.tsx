'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Cpu, ShieldCheck, UserCheck, BellRing, Sparkles } from 'lucide-react';

interface NavbarProps {
  aiRequired: boolean;
  onToggleAi: () => void;
  onOpenStationQrModal: () => void;
  onSimulateClaimPing: () => void;
  activePingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  aiRequired,
  onToggleAi,
  onOpenStationQrModal,
  onSimulateClaimPing,
  activePingCount,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Manila',
        }) + ' PHT'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-nav sticky top-0 z-40 w-full px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
      {/* Brand & Terminal Station */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <span className="text-white font-black text-xl tracking-wider">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">ParcelHub</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Staff Desk Terminal
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">CTU-DANAO-MAIN-HUB · Campus Gate 1</p>
          </div>
        </div>
      </div>

      {/* Center: Status Telemetry & Live Clock */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">Live Escrow Sync</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-slate-400">{time || '18:00:00 PHT'}</span>
        </div>

        {/* AI Gate Status Toggle */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            aiRequired
              ? 'bg-blue-950/60 border-blue-600/50 text-blue-300 hover:bg-blue-900/60'
              : 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/40'
          }`}
          title="Click to toggle Gemini AI requirement rule"
        >
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Gemini 3.5 Flash-Lite:</span>
          <span className="font-bold uppercase tracking-wider text-[10px]">
            {aiRequired ? 'Enforced' : 'Manual Override'}
          </span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Simulate claim ping button for dev / testing */}
        <button
          onClick={onSimulateClaimPing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all hover:scale-105 active:scale-95"
          title="Simulate student scanning station QR with 6-digit MPIN"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate QR Ping</span>
          {activePingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
              {activePingCount}
            </span>
          )}
        </button>

        {/* Printable Station QR Code Modal Trigger */}
        <button
          onClick={onOpenStationQrModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Print Station QR</span>
        </button>

        {/* Active Staff Session */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            OP
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Counter Staff</p>
            <p className="text-[10px] text-slate-400 font-mono leading-none mt-1">ID: ST-0488</p>
          </div>
        </div>
      </div>
    </header>
  );
};
