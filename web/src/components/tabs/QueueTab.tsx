'use client';

import React, { useState } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { UserCheck, CheckCircle2, Lock, ShieldCheck, ArrowRight, Layers, Eye } from 'lucide-react';

interface QueueTabProps {
  parcels: ParcelRow[];
  visualLogs: VisualLogRow[];
  onOpenClaimModal: (parcel: ParcelRow) => void;
  onOpenDetailModal: (parcel: ParcelRow) => void;
  onBatchExecuteClaim: (parcelIds: string[]) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
  parcels,
  visualLogs,
  onOpenClaimModal,
  onOpenDetailModal,
  onBatchExecuteClaim,
}) => {
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Filter for packages in custody (RECEIVED_LOGGED)
  const custodyParcels = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED'
  );

  // Active pinged parcels ready for handover
  const pingedParcels = custodyParcels.filter((p) => Boolean(p.claim_pinged_at));

  // Sorted so active pings appear at the top
  const sortedParcels = [...custodyParcels].sort((a, b) => {
    if (a.claim_pinged_at && !b.claim_pinged_at) return -1;
    if (!a.claim_pinged_at && b.claim_pinged_at) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const handleBatchRelease = async () => {
    if (pingedParcels.length === 0 || isBatchProcessing) return;
    setIsBatchProcessing(true);
    await onBatchExecuteClaim(pingedParcels.map((p) => p.parcel_id));
    setIsBatchProcessing(false);
  };

  return (
    <div className="space-y-4">
      {/* Minimalist Tab Header Banner */}
      <div className="card-lift glass-card p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Inverted Claim Handshake Queue</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-success-subtle text-success border border-success/30">
              {custodyParcels.length} In Custody
            </span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click any consignment to review PoLP audit details or fulfill counter pickup.
          </p>
        </div>

        {pingedParcels.length > 1 && (
          <button
            type="button"
            onClick={handleBatchRelease}
            disabled={isBatchProcessing}
            aria-label={`Batch release all ${pingedParcels.length} pinged parcels`}
            className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-[0_2px_12px_rgba(255,45,32,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <Layers className="relative z-10 w-3.5 h-3.5" />
            <span className="relative z-10">Batch Release Pinged ({pingedParcels.length})</span>
          </button>
        )}
      </div>

      {sortedParcels.length === 0 ? (
        <div className="card-lift glass-card p-12 text-center rounded-2xl bg-surface border border-border">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-3 border border-border">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">Queue Empty</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            No parcels currently waiting in hub custody. Once incoming courier shipments are verified via intake, they appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sortedParcels.map((parcel) => {
            const hasPing = Boolean(parcel.claim_pinged_at);
            const vLog = visualLogs.find((v) => v.parcel_id === parcel.parcel_id);

            return (
              <div
                key={parcel.parcel_id}
                className={`card-lift glass-card p-5 rounded-2xl bg-surface border transition-all ${
                  hasPing
                    ? 'border-primary/40 ring-1 ring-primary/20 shadow-md'
                    : 'border-border opacity-95'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {parcel.recipient_name || 'Registered Recipient'}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.2 rounded-full">
                        {parcel.recipient_school_id || 'CTU-2024'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Waybill: <strong className="text-foreground">{parcel.waybill_number}</strong> ({parcel.carrier})
                    </p>
                  </div>

                  {hasPing ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 flex items-center gap-1 animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Ping Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                {/* Change Breakdown & Visual Log State */}
                <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-xs mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Enclosed Change:</span>
                    <span className="font-mono font-bold text-success">
                      ₱{Math.max(0, parcel.change_due).toFixed(2)}
                    </span>
                  </div>

                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>{vLog ? 'AI Logged' : 'Intake Verified'}</span>
                  </span>
                </div>

                {/* Modal Action Triggers */}
                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => onOpenClaimModal(parcel)}
                    aria-label={`Open handover modal for waybill ${parcel.waybill_number}`}
                    className={`relative inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${
                      hasPing
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_2px_10px_rgba(255,45,32,0.3)]'
                        : 'bg-muted text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-border'
                    }`}
                  >
                    {hasPing && (
                      <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    )}
                    {hasPing ? (
                      <>
                        <CheckCircle2 className="relative z-10 w-3.5 h-3.5" />
                        <span className="relative z-10">Fulfill Handover</span>
                        <ArrowRight className="relative z-10 w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>View Lock Status</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(parcel)}
                    aria-label={`Inspect PoLP audit details for ${parcel.waybill_number}`}
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border"
                    title="Inspect complete audit trail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
