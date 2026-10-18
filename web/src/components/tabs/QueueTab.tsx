'use client';

import React, { useState } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { UserCheck, CheckCircle2, Clock, ShieldCheck, Lock, Layers } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Inverted Claim Handshake Queue</span>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-success-subtle text-success border border-success/30">
              Live Realtime Queue
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Releasing is strictly locked until the student enters their 6-digit MPIN on mobile to dispatch a claim ping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pingedParcels.length > 1 && (
            <button
              type="button"
              onClick={handleBatchReleaseAllPinged}
              disabled={Boolean(executingId)}
              aria-label={`Batch release all ${pingedParcels.length} pinged parcels`}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
            >
              <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <Layers className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">Batch Release All Pinged ({pingedParcels.length})</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted px-4 py-2 rounded-full border border-border">
            <Clock className="w-4 h-4 text-primary" />
            <span>Station: CTU-DANAO-MAIN-HUB</span>
          </div>
        </div>
      </div>

      {sortedParcels.length === 0 ? (
        <div className="card-lift glass-card p-12 text-center rounded-2xl bg-surface border border-border">
          <div className="w-16 h-16 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-4 border border-border">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Queue Empty</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
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
                className={`card-lift glass-card p-6 rounded-2xl bg-surface border transition-all ${
                  hasPing
                    ? 'border-primary/40 ring-1 ring-primary/20 shadow-md'
                    : 'border-border opacity-90'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Recipient & Parcel Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {hasPing ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-success" />
                          Student at Counter (MPIN Ping Active)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                          <Lock className="w-3 h-3" />
                          Awaiting Student MPIN Claim Ping
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {parcel.carrier}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-lg font-bold text-foreground">
                          {parcel.recipient_name || 'Registered Recipient'}
                        </h3>
                        <span className="text-xs font-mono font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          ID: {parcel.recipient_school_id || 'CTU-2024-8841'}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        Waybill: <span className="text-foreground font-bold">{parcel.waybill_number}</span>
                      </p>
                    </div>

                    {/* Audit Attribution */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Visual Log: {vLog ? 'Verified by Gemini AI' : 'Logged'}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Funded by: {parcel.payment_staff_id || 'STAFF-0488'}
                      </span>
                    </div>
                  </div>

                  {/* Center: Physical Envelope Disbursal Breakdown */}
                  <div className="bg-surface-elevated p-4 rounded-2xl border border-border min-w-[260px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      Envelope Change Reconciliation
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Deposited:</span>
                        <span className="font-mono font-bold text-foreground">
                          ₱{parcel.cash_deposited.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Courier COD Paid:</span>
                        <span className="font-mono font-bold text-foreground">
                          ₱{parcel.cod_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-border font-bold">
                        <span className="text-success font-semibold">Change in Envelope:</span>
                        <span className="text-lg font-mono text-success font-extrabold">
                          ₱{Math.max(0, parcel.change_due).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Atomic Handshake Action Button (Strictly Locked without Ping) */}
                  <div className="flex flex-col justify-center min-w-[230px]">
                    <button
                      type="button"
                      onClick={() => handleClaimSingle(parcel.parcel_id)}
                      disabled={!hasPing || isProcessing}
                      aria-label={
                        hasPing
                          ? `Release and disburse change for waybill ${parcel.waybill_number}`
                          : `Handover locked for waybill ${parcel.waybill_number} awaiting client MPIN ping`
                      }
                      className={`relative inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${
                        hasPing
                          ? 'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98] shadow-[0_6px_20px_rgba(217,38,26,0.35)] cursor-pointer'
                          : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60'
                      }`}
                    >
                      {hasPing && (
                        <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      )}
                      {hasPing ? (
                        <>
                          <CheckCircle2 className="relative z-10 w-4 h-4" />
                          <span className="relative z-10">Release & Disburse</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span>Locked (Awaiting Ping)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
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
