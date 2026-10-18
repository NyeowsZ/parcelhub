'use client';

import React from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Check } from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const isLive = isSupabaseConfigured();

  if (!isOpen) return null;

  return (
    <div 
      id="database-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
        {/* Close Button (1:1 from references/feedback-dialogs.md lines 57-65) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Stack (1:1 from references/feedback-dialogs.md lines 67-75) */}
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Persistence Engine
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            PostgreSQL & Realtime Sync
          </h2>
          <p className="text-xs text-muted-foreground">
            Supabase architecture, realtime pub/sub channels, and relational escrow schema.
          </p>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface-elevated border border-border">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLive ? 'bg-success animate-pulse' : 'bg-warning'
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {isLive ? 'Connected to Live Supabase' : 'Running in Local Sandbox Mode'}
          </span>
        </div>

        {isLive ? (
          <div className="bg-success/10 p-5 rounded-2xl border border-success/25 text-xs text-success space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <Check className="w-4 h-4 text-success" />
              <span>Live Database & Realtime Pub/Sub Active</span>
            </p>
            <p className="leading-relaxed opacity-90">
              Terminal is syncing directly with Supabase. Pre-registrations, cash-in transactions, and mobile claim pings persist and broadcast in real time across clients.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-warning/10 p-5 rounded-2xl border border-warning/25 text-xs text-warning space-y-2">
              <p className="font-bold text-sm">How to connect your live Supabase database:</p>
              <ol className="list-decimal pl-4 space-y-1.5 opacity-90">
                <li>
                  Open your <strong>Supabase Dashboard</strong> (or create a free project at supabase.com).
                </li>
                <li>
                  Go to <strong>SQL Editor</strong> and run the contents of{' '}
                  <code className="bg-surface px-1.5 py-0.5 rounded border border-warning/30 font-mono font-bold">
                    web/schema.sql
                  </code>.
                </li>
                <li>
                  In your local <code className="bg-surface px-1.5 py-0.5 rounded border border-warning/30 font-mono">.env.local</code>, add:
                  <div className="mt-1.5 font-mono text-[11px] bg-surface p-3 rounded-xl border border-warning/30 space-y-1 text-foreground">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your-supabase-url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-surface-elevated p-4 rounded-2xl border border-border text-xs text-muted-foreground flex items-center justify-between">
              <span className="font-medium">Database Schema: <strong className="text-foreground font-mono">web/schema.sql</strong></span>
              <span className="text-[11px] text-primary font-bold uppercase tracking-wider font-mono">Ready in repo</span>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring"
        >
          Return to Terminal
        </button>
      </div>
    </div>
  );
};
