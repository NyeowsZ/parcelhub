'use client';

import React from 'react';
import { Package, Banknote, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Hero KPI Metric Card: Station Claim Queue */}
      <div className="card-lift glass-card p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Station Claim Queue
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activePings > 0
                  ? 'bg-success-subtle text-success'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <UserCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-foreground">
              {activePings}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Students at Desk
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground mt-1.5">
            {activePings > 0 ? (
              <span className="text-success font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Active MPIN Handshake Pending
              </span>
            ) : (
              'Listening for student QR scans'
            )}
          </p>
        </div>

        {activePings > 0 && (
          <button
            type="button"
            onClick={onNavigateToQueue}
            aria-label="Fulfill pickup handshake in queue tab"
            className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
          >
            <span>Fulfill Pickup Handshake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. In Hub Custody Card */}
      <div className="card-lift glass-card p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              In Hub Custody
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-foreground">
              {readyInCustody}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verified Packages
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-border mt-2.5 text-[11px] text-muted-foreground flex justify-between items-center">
          <span>Enclosed change:</span>
          <span className="font-mono font-bold text-success bg-success-subtle px-2 py-0.5 rounded-full border border-success/20">
            ₱{totalChangeHeld.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. Funded Envelopes Card */}
      <div className="card-lift glass-card p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Funded Envelopes
            </span>
            <div className="w-8 h-8 rounded-full bg-warning-subtle text-warning flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tracking-tight text-foreground">
              {fundedWaitingCourier}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Awaiting Courier
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-border mt-2.5 text-[11px] text-warning font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
          <span>Exact COD cash sealed in envelopes</span>
        </div>
      </div>

      {/* 4. Escrow Cash Float Card */}
      <div className="card-lift glass-card p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Escrow Cash Float
            </span>
            <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-muted-foreground">₱</span>
            <span className="text-3xl font-black font-mono tracking-tight text-foreground">
              {totalCashHeld.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-border mt-2.5 text-[11px] text-muted-foreground">
          Zero-credit escrow: 100% solvency guaranteed
        </div>
      </div>
    </div>
  );
};
