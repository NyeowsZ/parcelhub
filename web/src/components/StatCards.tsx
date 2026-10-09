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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* 1. Hero Metric Card: Deep Slate High-Contrast Card per DESIGN_CONTEXT.md Section 5.3 */}
      <div className="hero-inverse-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Station Claim Queue
            </span>
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                activePings > 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {activePings}
            </span>
            <span className="text-sm font-medium text-slate-300">
              Students at Desk
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {activePings > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active MPIN Handshake Pending
              </span>
            ) : (
              'Listening for student QR scans'
            )}
          </p>
        </div>

        {activePings > 0 && (
          <button
            onClick={onNavigateToQueue}
            className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Fulfill Pickup Handshake</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. In Hub Custody: Crisp White Card (Level 1 Elevation) */}
      <div className="surface-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              In Hub Custody
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {readyInCustody}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Verified Packages
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-600 flex justify-between items-center">
          <span>Enclosed change:</span>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            ₱{totalChangeHeld.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. Funded Envelopes: Crisp White Card */}
      <div className="surface-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Funded Envelopes
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {fundedWaitingCourier}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Awaiting Courier
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-amber-700 font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Exact COD cash isolated in envelopes</span>
        </div>
      </div>

      {/* 4. Escrow Cash Float: Crisp White Card */}
      <div className="surface-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Escrow Cash Float
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-400">₱</span>
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-mono">
              {totalCashHeld.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
          Zero-credit escrow: 100% solvency guaranteed
        </div>
      </div>
    </div>
  );
};
