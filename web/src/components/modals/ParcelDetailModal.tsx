'use client';

import React from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { X, ShieldCheck, CheckCircle2, Clock, Package, Eye } from 'lucide-react';

interface ParcelDetailModalProps {
  parcel: ParcelRow | null;
  visualLog?: VisualLogRow;
  isOpen: boolean;
  onClose: () => void;
}

export const ParcelDetailModal: React.FC<ParcelDetailModalProps> = ({
  parcel,
  visualLog,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !parcel) return null;

  const states = ['STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED'] as const;
  const currentIndex = states.indexOf(parcel.current_status);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcel-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-border space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close parcel detail dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="parcel-detail-title" className="text-xl font-extrabold text-foreground tracking-tight">
                Consignment Audit Record
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {parcel.carrier}
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Waybill: <strong className="text-foreground">{parcel.waybill_number}</strong>
            </p>
          </div>
        </div>

        {/* Lifecycle Progression Timeline */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Monotonic State Progression
          </span>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {states.map((st, i) => {
              const isPast = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={st} className="text-center space-y-1.5">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-primary shadow-[0_0_8px_rgba(255,45,32,0.5)]'
                        : isPast
                        ? 'bg-success'
                        : 'bg-muted'
                    }`}
                  />
                  <p className={`text-[9px] font-bold uppercase tracking-tight ${
                    isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {st === 'RECEIVED_LOGGED' ? 'IN CUSTODY' : st}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recipient Credentials (PoLP) */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Recipient:</span>
            <span className="font-bold text-foreground">{parcel.recipient_name}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>School ID:</span>
            <span className="font-mono font-semibold text-primary">{parcel.recipient_school_id}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Current Status:</span>
            <span className="font-bold uppercase text-foreground">{parcel.current_status}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Registered:</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {new Date(parcel.created_at).toLocaleString('en-US', { hour12: false })}
            </span>
          </div>
        </div>

        {/* Physical Envelope Escrow Ledger */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Envelope Cash Isolation
          </span>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Deposited Cash:</span>
              <span className="font-mono font-bold text-foreground">₱{parcel.cash_deposited.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Courier COD Amount:</span>
              <span className="font-mono font-bold text-warning">₱{parcel.cod_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1.5 border-t border-border font-bold">
              <span className="text-success">Envelope Change:</span>
              <span className="font-mono text-base text-success font-extrabold">
                ₱{Math.max(0, parcel.change_due).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini AI Visual Verification Record */}
        {visualLog && (
          <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>Gemini AI Visual Audit Telemetry</span>
            </span>

            <div className="space-y-1.5">
              <div className="flex justify-between text-muted-foreground">
                <span>OCR Extracted Waybill:</span>
                <span className="font-mono font-bold text-foreground">{visualLog.detected_waybill || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Package Condition:</span>
                <span className="font-bold text-success">{visualLog.package_condition}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Match Confidence:</span>
                <span className="font-mono font-bold text-foreground">
                  {(visualLog.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {visualLog.image_storage_uri && (
              <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted mt-2">
                <img src={visualLog.image_storage_uri} alt="Intake Snapshot" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Audit Stamps */}
        <div className="p-4 rounded-2xl bg-muted text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Station Code: {parcel.payment_station_code || 'CTU-DANAO-MAIN-HUB'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Funded By Operator: {parcel.payment_staff_id || 'STAFF-0488'}</span>
          </div>
        </div>

        {/* Close Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted hover:bg-surface-elevated text-foreground border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
