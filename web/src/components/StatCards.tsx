'use client';

import React from 'react';
import { ParcelRow } from '../types/database';

interface StatCardsProps {
  parcels: ParcelRow[];
  onNavigateToQueue: () => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ parcels, onNavigateToQueue }) => {
  const readyInCustody = parcels.filter((p) => p.current_status === 'RECEIVED_LOGGED').length;
  const fundedWaitingCourier = parcels.filter((p) => p.current_status === 'FUNDED').length;
  const activePings = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED' && p.claim_pinged_at
  ).length;

  const totalCashHeld = parcels
    .filter((p) => p.current_status === 'FUNDED' || p.current_status === 'RECEIVED_LOGGED')
    .reduce((sum, p) => sum + p.cash_deposited, 0);

  const totalChangeHeld = parcels
    .filter((p) => p.current_status === 'RECEIVED_LOGGED')
    .reduce((sum, p) => sum + Math.max(0, p.change_due), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 1. Station Claim Queue (1:1 High-Density KPI Recipe) */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-widest">Station Claim Queue</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              activePings > 0
                ? 'bg-primary/10 text-primary border border-primary/25 animate-pulse'
                : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            {activePings > 0 ? `${activePings} Active Ping` : 'Standby'}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
            {activePings}
          </div>
          <p className="text-xs text-muted-foreground">
            {activePings > 0
              ? 'Students present at counter ready for atomic handshake.'
              : 'Listening for student arrival scan pulses.'}
          </p>
        </div>
        {activePings > 0 && (
          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onNavigateToQueue}
              className="w-full py-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-hover flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <span>Fulfill Handshake</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 2. In Hub Custody */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-widest">Hub Custody</span>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/25">
            Verified
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
            {readyInCustody}
          </div>
          <p className="text-xs text-muted-foreground">
            Inspected via Gemini AI vision & locked in storage shelves.
          </p>
        </div>
      </div>

      {/* 3. Pre-Funded Staging */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-widest">Pre-Funded Envelopes</span>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-muted text-muted-foreground border border-border">
            Awaiting Courier
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
            {fundedWaitingCourier}
          </div>
          <p className="text-xs text-muted-foreground">
            COD cash envelope prepared in vault for courier arrival.
          </p>
        </div>
      </div>

      {/* 4. Vault Solvency Reserve */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-widest">Escrow Vault Cash</span>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-success/15 text-success border border-success/30">
            100% Solvency
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
            ₱{totalCashHeld.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Physical change reserve: ₱{totalChangeHeld.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
