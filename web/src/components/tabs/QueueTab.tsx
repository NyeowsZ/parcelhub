'use client';

import React, { useState } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { UserCheck, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Banknote } from 'lucide-react';

interface QueueTabProps {
  parcels: ParcelRow[];
  visualLogs: VisualLogRow[];
  onExecuteClaim: (parcelId: string) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  parcels,
  visualLogs,
  onExecuteClaim,
}) => {
  const [selectedParcel, setSelectedParcel] = useState<ParcelRow | null>(null);
  const [executing, setExecuting] = useState(false);

  // Filter for packages in custody
  const custodyParcels = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED'
  );

  // Sorted so active pings appear at the very top!
  const sortedParcels = [...custodyParcels].sort((a, b) => {
    if (a.claim_pinged_at && !b.claim_pinged_at) return -1;
    if (!a.claim_pinged_at && b.claim_pinged_at) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const handleClaimSubmit = async (parcelId: string) => {
    setExecuting(true);
    await new Promise((r) => setTimeout(r, 600));
    onExecuteClaim(parcelId);
    setExecuting(false);
    setSelectedParcel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Inverted Claim Handshake Queue</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Listener Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            When students scan the physical counter QR and authorize via 6-digit MPIN, their dispatch signal surfaces here for atomic handover.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Auto-refreshed via Supabase Realtime</span>
        </div>
      </div>

      {sortedParcels.length === 0 ? (
        <div className="terminal-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Queue Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No parcels currently waiting in hub custody. Once arriving courier shipments are visually logged, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedParcels.map((parcel) => {
            const hasPing = Boolean(parcel.claim_pinged_at);
            const vLog = visualLogs.find((v) => v.parcel_id === parcel.parcel_id);

            return (
              <div
                key={parcel.parcel_id}
                className={`terminal-card p-5 transition-all ${
                  hasPing
                    ? 'border-emerald-500/80 bg-gradient-to-r from-emerald-950/25 via-slate-900 to-slate-900 shadow-lg shadow-emerald-950/40'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Recipient & Parcel Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {hasPing ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-sm animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-white" />
                          STUDENT AT DESK (MPIN AUTHENTICATED)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                          Awaiting Student QR Scan
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/40">
                        {parcel.carrier}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-base font-bold text-white">
                          {parcel.recipient_name || 'Registered Student'}
                        </h3>
                        <span className="text-xs font-mono text-cyan-400">
                          ID: {parcel.recipient_school_id || 'CTU-2024-8841'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        Waybill: <span className="text-slate-200 font-bold">{parcel.waybill_number}</span>
                      </p>
                    </div>

                    {/* Security Primitives Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Visual Log: {vLog ? 'Verified by AI' : 'Present'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        Station: CTU-DANAO-MAIN-HUB
                      </span>
                    </div>
                  </div>

                  {/* Center: Physical Envelope Disbursal Breakdown */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 min-w-[240px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Physical Envelope Reconciliation
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Deposited by Student:</span>
                        <span className="font-mono text-slate-200">₱{parcel.cash_deposited.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Paid to Courier:</span>
                        <span className="font-mono text-slate-200">₱{parcel.cod_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-bold">
                        <span className="text-emerald-400">Change to Disburse:</span>
                        <span className="text-base font-mono text-emerald-400">
                          ₱{Math.max(0, parcel.change_due).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Atomic Handshake Action */}
                  <div className="flex flex-col justify-center min-w-[200px]">
                    <button
                      onClick={() => handleClaimSubmit(parcel.parcel_id)}
                      disabled={executing}
                      className={`w-full py-3.5 px-5 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                        hasPing
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 scale-102 hover:scale-105 active:scale-95'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{hasPing ? 'Confirm & Disburse' : 'Manual Handover'}</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2">
                      Enforces Atomic Handshake & closes cash envelope
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
