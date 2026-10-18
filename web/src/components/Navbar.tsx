'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Cpu, Sparkles, Database, LogOut, FileText } from 'lucide-react';
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
    <header className="glass-dock sticky top-0 z-40 w-full px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      {/* Brand & Terminal Station */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-[0_4px_16px_rgba(217,38,26,0.35)]">
            <span>P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground tracking-tight uppercase">
                ParcelHub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                Staff Terminal
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              CTU-DANAO-MAIN-HUB · Campus Gate 1
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Escrow Sync & AI Gate Status */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* Clock & Realtime indicator */}
        <div className="flex items-center gap-2 bg-muted px-3.5 py-1.5 rounded-full border border-border">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold text-foreground">Live Counter</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {time || '18:00:00 PHT'}
          </span>
        </div>

        {/* Database Live Status Button */}
        <button
          type="button"
          onClick={onOpenDatabaseModal}
          aria-label="View Supabase database connection and schema"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isLive
              ? 'bg-success-subtle border-success/30 text-success'
              : 'bg-warning-subtle border-warning/30 text-warning'
          }`}
          title="Click to check Supabase database connection and view schema"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isLive ? 'Supabase: Active' : 'Local Sandbox'}</span>
        </button>

        {/* AI Setting 1: Student Receipt OCR Toggle */}
        <button
          type="button"
          onClick={onToggleUserReceiptAi}
          aria-label="Toggle student receipt AI OCR feature"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            userReceiptAi
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted border-border text-muted-foreground'
          }`}
          title="Toggle Student Receipt AI OCR: If disabled, mobile user skips receipt OCR and enters manually."
        >
          <FileText className="w-3.5 h-3.5" />
          <span>User AI OCR:</span>
          <span className="font-extrabold">{userReceiptAi ? 'ON' : 'OFF'}</span>
        </button>

        {/* AI Setting 2: Staff Intake Precheck Toggle */}
        <button
          type="button"
          onClick={onToggleStaffIntakeAi}
          aria-label="Toggle staff intake AI precheck feature"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            staffIntakeAi
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted border-border text-muted-foreground'
          }`}
          title="Toggle Staff Intake AI Precheck: If disabled, counter staff bypasses AI camera scan."
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Staff AI Intake:</span>
          <span className="font-extrabold">{staffIntakeAi ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Right: Authenticated Operator Badge & Fast Actions */}
      <div className="flex items-center gap-2.5">
        {/* Simulate Payment Ping (for testing counter cash-in gate) */}
        <button
          type="button"
          onClick={onSimulatePaymentPing}
          aria-label="Simulate student scanning station QR to pay cash"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-warning-subtle text-warning border border-warning/30 hover:bg-warning/20 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Simulate student scanning station QR to pay cash"
        >
          <span>⚡ Ping Cash Desk</span>
        </button>

        {/* Realtime Claim Ping Indicator */}
        <button
          type="button"
          onClick={onSimulateClaimPing}
          aria-label="Simulate student dispatching claim ping from mobile client"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activePingCount > 0
              ? 'bg-success-subtle border-success/40 text-success animate-pulse'
              : 'bg-muted border-border text-muted-foreground hover:text-foreground'
          }`}
          title="Simulate student dispatching claim ping from mobile client"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>{activePingCount > 0 ? `${activePingCount} Student Claim Active` : 'Simulate Claim'}</span>
        </button>

        {/* Printable Hub QR Trigger */}
        <button
          type="button"
          onClick={onOpenStationQrModal}
          aria-label="Open printable Station QR poster"
          className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary rounded-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(217,38,26,0.35)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
        >
          <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <QrCode className="relative z-10 w-4 h-4" />
          <span className="relative z-10 hidden sm:inline">Station QR</span>
        </button>

        {/* Staff Session Status */}
        {staffSession && (
          <div className="flex items-center gap-2.5 pl-2.5 border-l border-border">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold font-mono text-foreground leading-none">
                {staffSession.staffId}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {staffSession.fullName}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogoutStaff}
              aria-label="Log out staff session"
              className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
