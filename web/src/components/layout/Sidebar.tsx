'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTerminal } from '@/context/TerminalContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  UserCheck,
  Camera,
  Banknote,
  History,
  Settings,
  LogOut,
  QrCode,
  Database,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    parcels,
    staffSession,
    logoutStaff,
    isDarkMode,
    toggleTheme,
    setIsStationQrModalOpen,
    setIsDatabaseModalOpen,
    setIsAuthModalOpen,
  } = useTerminal();

  const isLive = isSupabaseConfigured();

  // Route counts
  const activePingCount = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED' && p.claim_pinged_at
  ).length;
  const custodyCount = parcels.filter((p) => p.current_status === 'RECEIVED_LOGGED').length;
  const fundedCount = parcels.filter((p) => p.current_status === 'FUNDED').length;
  const stagedCount = parcels.filter((p) => p.current_status === 'STAGED').length;

  const navItems = [
    {
      href: '/queue',
      altHref: '/',
      label: 'Claim Queue',
      icon: UserCheck,
      badge: custodyCount,
      ping: activePingCount,
    },
    {
      href: '/intake',
      label: 'Courier Intake',
      icon: Camera,
      badge: fundedCount,
    },
    {
      href: '/cash-in',
      label: 'Cash-In & Envelopes',
      icon: Banknote,
      badge: stagedCount,
    },
    {
      href: '/ledger',
      label: 'Vault & Ledger',
      icon: History,
      badge: parcels.length,
    },
    {
      href: '/settings',
      label: 'System & Station',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-surface/90 backdrop-blur-md border-r border-border p-5 flex flex-col justify-between transition-colors z-30">
      {/* Brand & Station Header */}
      <div className="space-y-6">
        <div>
          <Link
            href="/queue"
            className="flex items-center gap-2.5 text-foreground font-black tracking-tight text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="uppercase tracking-widest text-sm font-extrabold">ParcelHub</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Studio
            </span>
          </Link>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>CTU Danao · Counter 01</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
          </div>
        </div>

        {/* Functional Navigation */}
        <nav aria-label="Terminal Functions" className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.altHref && pathname === item.altHref);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(255,45,32,0.3)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-transparent hover:border-border'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.ping && item.ping > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-white text-primary animate-pulse">
                      {item.ping} Ping
                    </span>
                  ) : null}
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-black/20 text-white font-bold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Operator & Utility Controls */}
      <div className="space-y-3 pt-4 border-t border-border-subtle">
        {/* Quick Station QR Poster & Database Modals */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsStationQrModalOpen(true)}
            aria-label="Print Station QR Poster"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:bg-surface-elevated transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <QrCode className="w-3.5 h-3.5 text-primary" />
            <span>Poster</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDatabaseModalOpen(true)}
            aria-label="View Supabase connection"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:bg-surface-elevated transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>{isLive ? 'Supabase' : 'Sandbox'}</span>
          </button>
        </div>

        {/* Staff Session Card */}
        {staffSession ? (
          <div className="p-3 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-[10px] font-mono font-bold text-primary block">
                {staffSession.staffId}
              </span>
              <span className="font-semibold text-foreground text-xs truncate block">
                {staffSession.fullName}
              </span>
            </div>
            <button
              type="button"
              onClick={logoutStaff}
              aria-label="Log out staff session"
              className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring"
          >
            Authenticate Desk
          </button>
        )}

        {/* Dark/Light Theme Switcher (1:1 from references/navbar.md lines 58-70) */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="text-[11px] font-mono">Theme Mode</span>
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg className="w-4 h-4 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg className="w-4 h-4 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
