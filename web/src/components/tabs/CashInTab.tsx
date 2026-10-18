'use client';

import React from 'react';
import { ParcelRow } from '@/types/database';
import { Banknote, Lock, ArrowRight, Eye, ShieldCheck } from 'lucide-react';

interface CashInTabProps {
  parcels: ParcelRow[];
  onOpenCashInModal: (parcel: ParcelRow) => void;
  onOpenDetailModal: (parcel: ParcelRow) => void;
}

export const CashInTab: React.FC<CashInTabProps> = ({
  parcels,
  onOpenCashInModal,
  onOpenDetailModal,
}) => {
  // Eligible parcels are those in STAGED status awaiting physical deposit
  const stagedParcels = parcels.filter((p) => p.current_status === 'STAGED');

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="card-lift glass-card p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Physical Cash-In & Desk Funding Gate</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              {stagedParcels.length} Staged Consignments
            </span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Accept physical cash from students, seal exact COD in envelopes, and advance state to FUNDED.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium bg-muted px-3.5 py-1.5 rounded-full border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-warning" />
          <span>Invariant 3: Student Station Ping Required</span>
        </div>
      </div>

      {stagedParcels.length === 0 ? (
        <div className="card-lift glass-card p-12 text-center rounded-2xl bg-surface border border-border">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-3 border border-border">
            <Banknote className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">No Staged Consignments Awaiting Funding</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            When students pre-register consignments from the ParcelHub mobile client, they appear here awaiting physical cash-in.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {stagedParcels.map((parcel) => {
            const isPinged = Boolean(parcel.payment_pinged_at);

            return (
              <div
                key={parcel.parcel_id}
                className={`card-lift glass-card p-5 rounded-2xl bg-surface border transition-all ${
                  isPinged
                    ? 'border-primary/40 ring-1 ring-primary/20 shadow-md'
                    : 'border-border opacity-95'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {parcel.recipient_name || 'Student Consignment'}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {parcel.carrier}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Waybill: <strong className="text-foreground">{parcel.waybill_number}</strong>
                    </p>
                  </div>

                  {isPinged ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 flex items-center gap-1 animate-pulse shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Ping Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3" />
                      Scan Req
                    </span>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-xs mb-3.5">
                  <span className="text-muted-foreground">Required COD:</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {parcel.cod_amount === 0 ? 'Prepaid (₱0.00)' : `₱${parcel.cod_amount.toFixed(2)}`}
                  </span>
                </div>

                {!isPinged && (
                  <p className="text-[10px] text-warning bg-warning-subtle/50 px-2.5 py-1 rounded-xl mb-3 font-medium border border-warning/20">
                    ⚠ Invariant: Student must scan Station QR or enter Hub ID on mobile before staff can accept payment.
                  </p>
                )}

                {/* Modal Action Triggers */}
                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => onOpenCashInModal(parcel)}
                    aria-label={`Open cash-in modal for waybill ${parcel.waybill_number}`}
                    className={`relative inline-flex items-center justify-center gap-1.5 flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${
                      isPinged
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-[0_2px_10px_rgba(255,45,32,0.3)]'
                        : 'bg-muted text-muted-foreground hover:bg-surface-elevated hover:text-foreground border border-border'
                    }`}
                  >
                    {isPinged && (
                      <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    )}
                    <Banknote className="relative z-10 w-3.5 h-3.5" />
                    <span className="relative z-10">
                      {isPinged ? 'Accept Cash-In & Seal' : 'View Ping Status'}
                    </span>
                    <ArrowRight className="relative z-10 w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetailModal(parcel)}
                    aria-label={`Inspect details for ${parcel.waybill_number}`}
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
