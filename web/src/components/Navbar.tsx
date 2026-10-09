'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Cpu, Sparkles, Database, Clock, ShieldCheck, LogOut, FileText } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { StaffSession } from './StaffAuthModal';

interface NavbarProps {
  userReceiptAi: boolean;
  staffIntakeAi: boolean;
  onToggleUserReceiptAi: () => void;
  onToggleStaffIntakeAi: () => void;
  onOpenStationQrModal: () => void;
  onOpenDatabaseModal: () => void;
  onSimulateClaimPing: () => void;
  onSimulatePaymentPing: () => void;
  activePingCount: number;
  staffSession: StaffSession | null;
  onLogoutStaff: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userReceiptAi,
  staffIntakeAi,
  onToggleUserReceiptAi,
  onToggleStaffIntakeAi,
  onOpenStationQrModal,
  onOpenDatabaseModal,
  onSimulateClaimPing,
  onSimulatePaymentPing,
  activePingCount,
  staffSession,
  onLogoutStaff,
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
      <div className="hidden lg:flex items-center gap-3">
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
          <span>{isLive ? 'Supabase: Active' : 'Local Sandbox'}</span>
        </button>

        {/* AI Setting 1: Student Receipt OCR Toggle */}
        <button
          onClick={onToggleUserReceiptAi}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            userReceiptAi
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title="Toggle Student Receipt AI OCR: If disabled, mobile user skips receipt OCR and enters manually."
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>User AI OCR:</span>
          <span className="font-extrabold">{userReceiptAi ? 'ON' : 'OFF'}</span>
        </button>

        {/* AI Setting 2: Staff Intake Precheck Toggle */}
        <button
          onClick={onToggleStaffIntakeAi}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            staffIntakeAi
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title="Toggle Staff Intake AI Precheck: If disabled, counter staff bypasses AI camera scan."
        >
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>Staff AI Intake:</span>
          <span className="font-extrabold">{staffIntakeAi ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Right: Authenticated Operator Badge & Fast Actions */}
      <div className="flex items-center gap-3">
        {/* Simulate Payment Ping (for testing counter cash-in gate) */}
        <button
          onClick={onSimulatePaymentPing}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 active:scale-[0.98] transition-all"
          title="Simulate student scanning station QR to pay cash"
        >
          <span>⚡ Ping Cash Desk</span>
        </button>

        {/* Realtime Claim Ping Indicator */}
        <button
          onClick={onSimulateClaimPing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            activePingCount > 0
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 animate-pulse'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title="Simulate student dispatching claim ping from mobile client"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{activePingCount > 0 ? `${activePingCount} Student Claim Active` : 'Simulate Claim'}</span>
        </button>

        {/* Printable Hub QR Trigger */}
        <button
          onClick={onOpenStationQrModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-lg shadow-blue-600/20 transition-all"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Station QR</span>
        </button>

        {/* Staff Session Status */}
        {staffSession && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-900 leading-none">{staffSession.staffId}</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{staffSession.fullName}</p>
            </div>
            <button
              onClick={onLogoutStaff}
              className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Log out staff session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
