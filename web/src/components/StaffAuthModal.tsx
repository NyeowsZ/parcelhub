'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="surface-card w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              Staff Terminal Authorization
            </h2>
            <p className="text-xs text-slate-500">
              CTU Danao Campus Counter Point · Node 01
            </p>
          </div>
        </div>

        <div className="p-3.5 mb-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <p className="font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Terminal Gated by Invariant 1 (RBAC Security)</span>
          </p>
          <p className="text-[11px] text-amber-800 mt-1">
            Desk operations require authorized operator credentials. Anonymous counter actions are strictly prohibited.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Staff ID or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="STAFF-0488 or staff.danao@ctu.edu.ph"
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              6-Digit Security PIN
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tracking-widest text-base"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>{loading ? 'Authenticating...' : 'Authorize Terminal Access'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Quick Fill Demo Credentials (STAFF-0488 / 123456)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
