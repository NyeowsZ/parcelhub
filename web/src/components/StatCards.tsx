import React from 'react';
import { Package, Banknote, UserCheck, ShieldCheck } from 'lucide-react';
import { ParcelRow } from '../types/database';

interface StatCardsProps {
  parcels: ParcelRow[];
}

export const StatCards: React.FC<StatCardsProps> = ({ parcels }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* 1. Claim Pings Waiting (Highest Priority) */}
      <div
        className={`terminal-card p-5 relative overflow-hidden transition-all ${
          activePings > 0
            ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 glow-ping'
            : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Station Claim Queue
          </span>
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              activePings > 0
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{activePings}</span>
          <span className="text-xs font-medium text-slate-400">Students Waiting at Desk</span>
        </div>
        <p className="text-[11px] text-emerald-400 font-medium mt-2">
          {activePings > 0
            ? '● Ready for Atomic Handshake'
            : 'No active student pings'}
        </p>
      </div>

      {/* 2. In Hub Custody */}
      <div className="terminal-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            In Hub Custody
          </span>
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{readyInCustody}</span>
          <span className="text-xs font-medium text-slate-400">Verified Packages</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Enclosed change due: <span className="text-emerald-400 font-bold">₱{totalChangeHeld.toFixed(2)}</span>
        </p>
      </div>

      {/* 3. Funded Envelopes */}
      <div className="terminal-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Funded Envelopes
          </span>
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{fundedWaitingCourier}</span>
          <span className="text-xs font-medium text-slate-400">Awaiting Courier</span>
        </div>
        <p className="text-[11px] text-amber-400 font-medium mt-2">
          Exact COD cash isolated in envelopes
        </p>
      </div>

      {/* 4. Solvency Vault Balance */}
      <div className="terminal-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Escrow Cash Float
          </span>
          <div className="w-9 h-9 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-bold text-slate-400">₱</span>
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {totalCashHeld.toFixed(2)}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Zero-credit escrow: 100% solvency guaranteed
        </p>
      </div>
    </div>
  );
};
