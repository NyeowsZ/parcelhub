'use client';

import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isLive = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleCopySchemaNotice = () => {
    navigator.clipboard.writeText('-- Run web/schema.sql in Supabase SQL Editor');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Database Connection</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-xs font-semibold text-slate-600">
                {isLive ? 'Connected to Live Supabase' : 'Running in Local Sandbox Mode'}
              </span>
            </div>
          </div>
        </div>

        {isLive ? (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Live PostgreSQL Database & Realtime Pub/Sub Active
            </p>
            <p>
              Your terminal is syncing directly with Supabase. Pre-registrations, cash-in transactions, and mobile claim pings persist and broadcast in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold">How to connect your live Supabase database:</p>
              <ol className="list-decimal pl-4 space-y-1 text-amber-800">
                <li>
                  Open your <strong>Supabase Dashboard</strong> (or create a free project at supabase.com).
                </li>
                <li>
                  Go to <strong>SQL Editor</strong> and run the contents of{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">web/schema.sql</code>.
                </li>
                <li>
                  In your <strong>Vercel Project Settings</strong> (or local <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code>), add:
                  <div className="mt-1 font-mono text-[11px] bg-white p-2 rounded-xl border border-amber-200 space-y-1">
                    <div>NEXT_PUBLIC_SUPABASE_URL=your-supabase-url</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="font-medium">Database Schema File: <strong>web/schema.sql</strong></span>
              <span className="text-[11px] text-blue-600 font-bold">Ready in repo</span>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
