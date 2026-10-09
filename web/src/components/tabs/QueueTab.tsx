'use client';

import React, { useState } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { UserCheck, CheckCircle2, Clock, ShieldCheck, ArrowRight, Sparkles, Lock, Layers } from 'lucide-react';
import { StaffSession } from '../StaffAuthModal';

interface QueueTabProps {
  parcels: ParcelRow[];
  visualLogs: VisualLogRow[];
  staffSession: StaffSession | null;
  onExecuteClaim: (parcelIds: string | string[], staffId: string) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  parcels,
  visualLogs,
  staffSession,
  onExecuteClaim,
}) => {
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Filter for packages in custody (RECEIVED_LOGGED)
  const custodyParcels = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED'
  );

  // Active pinged parcels ready for handover
  const pingedParcels = custodyParcels.filter((p) => Boolean(p.claim_pinged_at));

  // Sorted so active pings appear at the very top!
  const sortedParcels = [...custodyParcels].sort((a, b) => {
    if (a.claim_pinged_at && !b.claim_pinged_at) return -1;
    if (!a.claim_pinged_at && b.claim_pinged_at) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const handleClaimSingle = async (parcelId: string) => {
    setExecutingId(parcelId);
    await new Promise((r) => setTimeout(r, 400));
    onExecuteClaim(parcelId, staffSession?.staffId || 'STAFF-0488');
    setExecutingId(null);
  };

  const handleBatchReleaseAllPinged = async () => {
    if (pingedParcels.length === 0) return;
    setExecutingId('BATCH');
    await new Promise((r) => setTimeout(r, 500));
    const ids = pingedParcels.map((p) => p.parcel_id);
    onExecuteClaim(ids, staffSession?.staffId || 'STAFF-0488');
    setExecutingId(null);
  };

  return (
    <div className="space-y-5">
      {/* Informative Header Banner */}
      <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <span>Inverted Claim Handshake Queue</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Live Realtime Queue
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Releasing is strictly locked until the student enters their 6-digit MPIN on mobile to dispatch a claim ping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pingedParcels.length > 1 && (
            <button
              onClick={handleBatchReleaseAllPinged}
              disabled={Boolean(executingId)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Batch Release All Pinged ({pingedParcels.length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 px-3.5 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Station: CTU-DANAO-MAIN-HUB</span>
          </div>
        </div>
      </div>

      {sortedParcels.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A] mb-1">Queue Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No parcels currently waiting in hub custody. Once incoming courier shipments are verified via intake, they appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedParcels.map((parcel) => {
            const hasPing = Boolean(parcel.claim_pinged_at);
            const vLog = visualLogs.find((v) => v.parcel_id === parcel.parcel_id);
            const isProcessing = executingId === parcel.parcel_id || executingId === 'BATCH';

            return (
              <div
                key={parcel.parcel_id}
                className={`surface-card p-6 transition-all ${
                  hasPing
                    ? 'border-emerald-300 ring-2 ring-emerald-400/20 bg-gradient-to-r from-emerald-50/40 via-white to-white shadow-md'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Recipient & Parcel Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {hasPing ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          STUDENT AT COUNTER (MPIN VERIFIED & PINGED)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          <Lock className="w-3 h-3 text-slate-400" />
                          AWAITING STUDENT MPIN CLAIM PING
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {parcel.carrier}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-lg font-bold text-[#0F172A]">
                          {parcel.recipient_name || 'Registered Recipient'}
                        </h3>
                        <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          ID: {parcel.recipient_school_id || 'CTU-2024-8841'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-1">
                        Waybill: <span className="text-slate-900 font-bold">{parcel.waybill_number}</span>
                      </p>
                    </div>

                    {/* Audit Attribution */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Visual Log: {vLog ? 'Verified by Gemini AI' : 'Logged'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        Funded by: {parcel.payment_staff_id || 'STAFF-0488'}
                      </span>
                    </div>
                  </div>

                  {/* Center: Physical Envelope Disbursal Breakdown */}
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 min-w-[260px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Envelope Change Reconciliation
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Deposited:</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₱{parcel.cash_deposited.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Courier COD Paid:</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₱{parcel.cod_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold">
                        <span className="text-emerald-800">Change in Envelope:</span>
                        <span className="text-lg font-mono text-emerald-700 font-extrabold">
                          ₱{Math.max(0, parcel.change_due).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Atomic Handshake Action Button (Strictly Locked without Ping) */}
                  <div className="flex flex-col justify-center min-w-[220px]">
                    <button
                      onClick={() => handleClaimSingle(parcel.parcel_id)}
                      disabled={!hasPing || isProcessing}
                      className={`w-full h-13 py-3 px-5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        hasPing
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                      }`}
                    >
                      {hasPing ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Release & Disburse Change</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Locked (Awaiting Ping)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                      {hasPing
                        ? 'Hand over parcel and cash change to recipient'
                        : 'Staff cannot release until client MPIN ping is active'}
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
