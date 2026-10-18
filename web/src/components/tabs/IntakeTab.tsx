'use client';

import React from 'react';
import { ParcelRow } from '@/types/database';
import { Camera, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

interface IntakeTabProps {
  parcels: ParcelRow[];
  onOpenIntakeModal: (parcel: ParcelRow) => void;
  onOpenDetailModal: (parcel: ParcelRow) => void;
}

export const IntakeTab: React.FC<IntakeTabProps> = ({
  parcels,
  onOpenIntakeModal,
  onOpenDetailModal,
}) => {
  // Eligible parcels are those in FUNDED state (cash secured in envelope!)
  const fundedParcels = parcels.filter((p) => p.current_status === 'FUNDED');

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="card-lift glass-card p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Courier Arrival & Intake Gate</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-warning-subtle text-warning border border-warning/30">
              {fundedParcels.length} Envelopes Funded
            </span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click &quot;Process Arrival&quot; on any funded consignment to open the camera intake viewfinder and disburse cash.
          </p>
        </div>
      </div>

      {fundedParcels.length === 0 ? (
        <div className="card-lift glass-card p-12 text-center rounded-2xl bg-surface border border-border">
          <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-3 border border-border">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">No Funded Consignments Awaiting Courier</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Parcels must be in <strong>FUNDED</strong> state with cash secured in envelopes. When students deposit cash at the counter, consignments appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {fundedParcels.map((parcel) => (
            <div
              key={parcel.parcel_id}
              className="card-lift glass-card p-5 rounded-2xl bg-surface border border-border space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {parcel.recipient_name || 'Student Recipient'}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {parcel.carrier}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Waybill: <strong className="text-foreground">{parcel.waybill_number}</strong>
                  </p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-warning-subtle text-warning border border-warning/30 shrink-0">
                  Funded & Ready
                </span>
              </div>

              {/* Envelope Financial Snapshot */}
              <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Cash in Envelope
                  </span>
                  <p className="font-mono font-bold text-success text-sm mt-0.5">
                    ₱{parcel.cash_deposited.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Expected COD
                  </span>
                  <p className="font-mono font-bold text-foreground text-sm mt-0.5">
                    ₱{parcel.cod_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => onOpenIntakeModal(parcel)}
                  aria-label={`Open courier intake modal for waybill ${parcel.waybill_number}`}
                  className="relative inline-flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] shadow-[0_2px_10px_rgba(255,45,32,0.3)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
                >
                  <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <Camera className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">Process Courier Arrival</span>
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
          ))}
        </div>
      )}
    </div>
  );
};
