'use client';

import React, { useState, useEffect } from 'react';
import { StaffSession } from './StaffAuthModal';
import { isSupabaseConfigured } from '@/lib/supabase';
import { QrCode, Database, LogOut, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER';
  onTabChange: (tab: 'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER') => void;
  queueCount: number;
  intakeCount: number;
  cashInCount: number;
  userReceiptAi: boolean;
  staffIntakeAi: boolean;
  onToggleUserReceiptAi: () => void;
  onToggleStaffIntakeAi: () => void;
  onOpenStationQrModal: () => void;
  onOpenDatabaseModal: () => void;
  onSimulateClaimPing: () => void;
  onSimulatePaymentPing: () => void;
  staffSession: StaffSession | null;
  onLogoutStaff: () => void;
  onOpenStaffAuth: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  queueCount,
  intakeCount,
  cashInCount,
  userReceiptAi,
  staffIntakeAi,
  onToggleUserReceiptAi,
  onToggleStaffIntakeAi,
  onOpenStationQrModal,
  onOpenDatabaseModal,
  onSimulateClaimPing,
  onSimulatePaymentPing,
  staffSession,
  onLogoutStaff,
  onOpenStaffAuth,
  onToggleTheme,
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
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Wordmark (1:1 Symph Studio Header Recipe) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            aria-label="ParcelHub Studio Home"
            className="flex items-center gap-2 text-foreground font-black tracking-tight text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="uppercase tracking-widest text-sm font-extrabold">ParcelHub</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Studio
            </span>
          </a>

          {/* Station Subtitle */}
          <span className="hidden xl:inline-block text-[11px] text-muted-foreground font-mono pl-2 border-l border-border">
            CTU Danao · Campus Node
          </span>
        </div>

        {/* Main Navigation Links with Sliding Underline (1:1 from references/navbar.md) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            type="button"
            onClick={() => onTabChange('QUEUE')}
            className={`relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:transition-transform after:duration-250 after:origin-left ${
              activeTab === 'QUEUE'
                ? 'text-primary after:scale-x-100'
                : 'text-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100'
            }`}
          >
            <span>Queue</span>
            {queueCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-primary text-primary-foreground">
                {queueCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('INTAKE')}
            className={`relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:transition-transform after:duration-250 after:origin-left ${
              activeTab === 'INTAKE'
                ? 'text-primary after:scale-x-100'
                : 'text-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100'
            }`}
          >
            <span>Intake</span>
            {intakeCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-primary/15 text-primary border border-primary/25">
                {intakeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('CASH_IN')}
            className={`relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:transition-transform after:duration-250 after:origin-left ${
              activeTab === 'CASH_IN'
                ? 'text-primary after:scale-x-100'
                : 'text-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100'
            }`}
          >
            <span>Cash-In</span>
            {cashInCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-muted text-muted-foreground">
                {cashInCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('LEDGER')}
            className={`relative px-3.5 py-2 text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm after:content-[''] after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:bg-primary after:transition-transform after:duration-250 after:origin-left ${
              activeTab === 'LEDGER'
                ? 'text-primary after:scale-x-100'
                : 'text-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100'
            }`}
          >
            <span>Ledger</span>
          </button>
        </nav>

        {/* Right Actions (1:1 from references/navbar.md) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Node Clock pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>{time || '18:00:00 PHT'}</span>
          </div>

          {/* Database Info Pill */}
          <button
            type="button"
            onClick={onOpenDatabaseModal}
            aria-label="View Supabase connection status"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-border-subtle transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Database className="w-3 h-3 text-primary" />
            <span>{isLive ? 'Supabase Live' : 'Local Mock'}</span>
          </button>

          {/* Station Poster QR Pill */}
          <button
            type="button"
            onClick={onOpenStationQrModal}
            aria-label="Print Station QR Poster"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* AI Toggle Pills */}
          <div className="hidden 2xl:flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border text-[10px]">
            <button
              type="button"
              onClick={onToggleUserReceiptAi}
              aria-label={`Toggle Student Receipt OCR AI (currently ${userReceiptAi ? 'enabled' : 'disabled'})`}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                userReceiptAi ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>User OCR</span>
            </button>
            <button
              type="button"
              onClick={onToggleStaffIntakeAi}
              aria-label={`Toggle Staff Intake Precheck AI (currently ${staffIntakeAi ? 'enabled' : 'disabled'})`}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                staffIntakeAi ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Staff AI</span>
            </button>
          </div>

          {/* Sim Trigger Pill */}
          <button
            type="button"
            onClick={onSimulateClaimPing}
            aria-label="Simulate Student Claim Ping Arrival"
            className="hidden xl:inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Sim Ping</span>
          </button>

          {/* Dark/Light Theme Toggle (Exact SVG Icons from references/navbar.md lines 64-69) */}
          <button
            type="button"
            onClick={onToggleTheme}
            id="theme-toggle"
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg className="w-4 h-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg className="w-4 h-4 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          {/* Staff Auth / Session Action Pill (1:1 from references/navbar.md line 73-78) */}
          {staffSession ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block px-3 py-1.5 text-[11px] font-mono font-bold rounded-full bg-muted border border-border text-foreground">
                {staffSession.staffId}
              </span>
              <button
                type="button"
                onClick={onLogoutStaff}
                aria-label="Log out staff member"
                className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenStaffAuth}
              className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-200 hover:shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span>Desk Auth</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
