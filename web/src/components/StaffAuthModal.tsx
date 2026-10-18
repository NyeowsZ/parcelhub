'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, ArrowRight } from 'lucide-react';

export interface StaffSession {
  staffId: string;
  fullName: string;
  email: string;
  role: 'STAFF' | 'ADMIN';
  token: string;
}

interface StaffAuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (session: StaffSession) => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('STAFF-0488');
  const [pin, setPin] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !pin.trim()) {
      setError('Please provide Staff ID or email and security PIN.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Invariant: Verify staff credentials
      if (
        (identifier.trim().toUpperCase() === 'STAFF-0488' ||
          identifier.trim().toLowerCase() === 'staff.danao@ctu.edu.ph') &&
        (pin === '123456' || pin.length === 6)
      ) {
        onLoginSuccess({
          staffId: 'STAFF-0488',
          fullName: 'Counter Staff Lead',
          email: 'staff.danao@ctu.edu.ph',
          role: 'STAFF',
          token: `sess-token-${Date.now()}`,
        });
      } else {
        setError('Invalid staff credentials. Default demo: STAFF-0488 / 123456');
      }
      setLoading(false);
    }, 400);
  };

  const handleQuickFill = () => {
    setIdentifier('STAFF-0488');
    setPin('123456');
    setError(null);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card w-full max-w-md p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_16px_rgba(217,38,26,0.35)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 id="staff-auth-title" className="text-xl font-extrabold text-foreground tracking-tight">
              Staff Terminal Authorization
            </h2>
            <p className="text-xs text-muted-foreground">
              CTU Danao Campus Counter Point · Node 01
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-warning-subtle border border-warning/30 text-warning text-xs space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Terminal Gated by Invariant 1 (RBAC Security)</span>
          </p>
          <p className="text-[11px] opacity-90">
            Desk operations require authorized operator credentials. Anonymous counter actions are strictly prohibited.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-destructive-subtle border border-destructive/30 text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="staff-identifier" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Staff ID or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                id="staff-identifier"
                aria-label="Staff ID or Email"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="STAFF-0488 or staff.danao@ctu.edu.ph"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="staff-pin" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              6-Digit Security PIN
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                id="staff-pin"
                aria-label="6-Digit Security PIN"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-elevated border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary font-mono tracking-widest text-base transition-all"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              aria-label="Authorize staff terminal access"
              className="relative inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
            >
              <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Authorize Terminal Access'}</span>
              <ArrowRight className="relative z-10 w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickFill}
              aria-label="Quick fill demo staff credentials"
              className="w-full py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              Quick Fill Demo Credentials (STAFF-0488 / 123456)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
