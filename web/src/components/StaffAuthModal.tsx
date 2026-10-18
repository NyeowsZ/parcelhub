'use client';

import React, { useState } from 'react';
import { Lock } from 'lucide-react';

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
      id="staff-auth-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
        {/* Title Stack (1:1 from references/feedback-dialogs.md lines 67-75) */}
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Desk Security
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            Staff Terminal Authorization
          </h2>
          <p className="text-xs text-muted-foreground">
            Desk operations require authorized operator credentials under Invariant 1 (RBAC Security).
          </p>
        </div>

        {/* Security Warning */}
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/25 text-warning text-xs space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Terminal Access Locked</span>
          </p>
          <p className="text-[11px] opacity-90 leading-relaxed">
            All desk handovers, cash acceptances, and payouts are cryptographically signed with your Staff ID.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Minimalist Underline Input for Staff ID (1:1 from references/feedback-dialogs.md lines 78-88) */}
          <div className="space-y-1">
            <label htmlFor="modal-staff-id" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Staff ID or Campus Work Email
            </label>
            <input 
              type="text" 
              id="modal-staff-id" 
              name="identifier" 
              aria-label="Staff ID or Campus Work Email"
              required 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="STAFF-0488"
              className="w-full bg-transparent border-0 border-b border-border py-2 text-sm text-foreground focus:border-b-2 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Minimalist Underline Input for PIN (1:1 from references/feedback-dialogs.md lines 90-100) */}
          <div className="space-y-1">
            <label htmlFor="modal-pin" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              6-Digit Security PIN
            </label>
            <input 
              type="password" 
              id="modal-pin" 
              name="pin" 
              aria-label="6-Digit Security PIN"
              required 
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              className="w-full bg-transparent border-0 border-b border-border py-2 text-sm text-foreground focus:border-b-2 focus:border-primary focus:outline-none transition-colors font-mono tracking-widest"
            />
          </div>

          {/* Quick-fill Demo Helper */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>Demo Account:</span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-primary hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
            >
              Fill Demo Credentials (STAFF-0488)
            </button>
          </div>

          {/* Primary Action Button (1:1 from references/feedback-dialogs.md lines 102-107) */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {loading ? 'Authenticating Operator...' : 'Authorize Terminal Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
