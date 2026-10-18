'use client';

import React from 'react';
import { X, Database, Check } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const isLive = isSupabaseConfigured();

  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="database-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-lg bg-surface rounded-3xl p-8 shadow-2xl border border-border text-foreground space-y-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close database connection dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 id="database-modal-title" className="text-xl font-extrabold text-foreground tracking-tight">
              Database Connection
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-success animate-pulse' : 'bg-warning'
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isLive ? 'Connected to Live Supabase' : 'Running in Local Sandbox Mode'}
              </span>
            </div>
          </div>
        </div>

        {isLive ? (
          <div className="bg-success-subtle p-5 rounded-2xl border border-success/30 text-xs text-success space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <Check className="w-4 h-4 text-success" />
              Live PostgreSQL Database & Realtime Pub/Sub Active
            </p>
            <p className="leading-relaxed opacity-90">
              Your terminal is syncing directly with Supabase. Pre-registrations, cash-in transactions, and mobile claim pings persist and broadcast in real time across clients.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-warning-subtle p-5 rounded-2xl border border-warning/30 text-xs text-warning space-y-2">
              <p className="font-bold text-sm">How to connect your live Supabase database:</p>
              <ol className="list-decimal pl-4 space-y-1.5 opacity-90">
                <li>
                  Open your <strong>Supabase Dashboard</strong> (or create a free project at supabase.com).
                </li>
                <li>
                  Go to <strong>SQL Editor</strong> and run the contents of{' '}
                  <code className="bg-surface px-1.5 py-0.5 rounded border border-warning/30 font-mono font-bold">web/schema.sql</code>.
                </li>
                <li>
                  In your local <code className="bg-surface px-1.5 py-0.5 rounded border border-warning/30 font-mono">.env.local</code> (or deployment environment), add:
                  <div className="mt-1.5 font-mono text-[11px] bg-surface p-3 rounded-xl border border-warning/30 space-y-1 text-foreground">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your-supabase-url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-surface-elevated p-4 rounded-2xl border border-border text-xs text-muted-foreground flex items-center justify-between">
              <span className="font-medium">Database Schema: <strong className="text-foreground">web/schema.sql</strong></span>
              <span className="text-[11px] text-primary font-bold uppercase tracking-wider">Ready in repo</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog and return to terminal"
            className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-foreground text-background hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
