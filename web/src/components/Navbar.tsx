'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Cpu, Sparkles, Database, Clock } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  aiRequired: boolean;
  onToggleAi: () => void;
  onOpenStationQrModal: () => void;
  onOpenDatabaseModal: () => void;
  onSimulateClaimPing: () => void;
  activePingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  aiRequired,
  onToggleAi,
  onOpenStationQrModal,
  onOpenDatabaseModal,
  onSimulateClaimPing,
  activePingCount,
}) => {
  const [time, setTime] = useState<string>('');
  const isLive = isSupabaseConfigured();

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
    <header className="glass-dock sticky top-0 z-40 w-full px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Terminal Station */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
            <span className="text-white font-black text-xl tracking-wider">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#0F172A] tracking-tight">ParcelHub</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Staff Counter Terminal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">CTU-DANAO-MAIN-HUB · Campus Gate 1</p>
          </div>
        </div>
      </div>

      {/* Center: Live Escrow Sync & AI Gate Status */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Clock & Realtime indicator */}
        <div className="flex items-center gap-2.5 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">Live Counter Node</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-mono font-medium text-slate-500">{time || '18:00:00 PHT'}</span>
        </div>

        {/* Database Live Status Button */}
        <button
          onClick={onOpenDatabaseModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isLive
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
          }`}
          title="Click to check Supabase database connection and view schema"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isLive ? 'Supabase Realtime: Active' : 'Database: Local Sandbox'}</span>
        </button>

        {/* AI Gate Status Toggle */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            aiRequired
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
          }`}
          title="Click to toggle Gemini AI requirement rule"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Audit:</span>
          <span className="font-extrabold uppercase text-[10px]">
            {aiRequired ? 'Enforced' : 'Bypass'}
          </span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Simulate claim ping button for dev / testing */}
        <button
          onClick={onSimulateClaimPing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-700 border border-blue-200 transition-all"
          title="Simulate student scanning station QR with 6-digit MPIN"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Simulate QR Ping</span>
          {activePingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
              {activePingCount}
            </span>
          )}
        </button>

        {/* Printable Station QR Code Modal Trigger */}
        <button
          onClick={onOpenStationQrModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-600/20 transition-all"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Print Station QR</span>
        </button>

        {/* Active Staff Session */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
            OP
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">Counter Staff</p>
            <p className="text-[10px] text-slate-500 font-mono leading-none mt-1">ID: ST-0488</p>
          </div>
        </div>
      </div>
    </header>
  );
};
