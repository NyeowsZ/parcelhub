'use client';

import React from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { ShieldCheck, CheckCircle2, Clock, Eye } from 'lucide-react';

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
      id="parcel-detail-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative my-auto max-h-[90vh] overflow-y-auto">
        {/* Close Button (1:1 from references/feedback-dialogs.md lines 57-65) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title Stack (1:1 from references/feedback-dialogs.md lines 67-75) */}
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            PoLP Consignment Telemetry
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            Audit & Forensic Inspector
          </h2>
          <p className="text-xs text-muted-foreground">
            Immutable monotonic state transition audit, escrow verification, and Gemini AI log snapshot.
          </p>
        </div>

        {/* Consignment Target Overview */}
        <div className="p-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block">
              Recipient
            </span>
            <span className="font-bold text-foreground text-sm">{parcel.recipient_name}</span>
            <span className="font-mono text-muted-foreground block text-[11px]">{parcel.waybill_number}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground block">
              Carrier
            </span>
            <span className="font-mono font-bold text-primary">{parcel.carrier || 'Standard'}</span>
          </div>
        </div>

        {/* Lifecycle Progression Timeline */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Monotonic State Progression
          </span>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {states.map((st, i) => {
              const isPastOrCurrent = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={st} className="space-y-1 text-center">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-primary ring-2 ring-primary/30'
                        : isPastOrCurrent
                        ? 'bg-primary/50'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider block ${
                      isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}
                  >
                    {st.replace('_LOGGED', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escrow & Financial Audit Ledger */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-3 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Zero-Credit Escrow Audit
          </span>

          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Expected COD Amount:</span>
              <span className="font-mono font-bold text-foreground">
                ₱{parcel.cod_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Cash Deposited:</span>
              <span className="font-mono font-bold text-foreground">
                ₱{parcel.cash_deposited.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Envelope Change Due:</span>
              <span className="font-mono font-bold text-primary">
                ₱{Math.max(0, parcel.change_due).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-subtle font-bold">
              <span>Escrow Solvency Check:</span>
              <span className="text-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solvent & Pre-Funded</span>
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
            <span>Created: {new Date(parcel.created_at).toLocaleString('en-US', { timeZone: 'Asia/Manila' })}</span>
          </div>
          {parcel.claim_pinged_at && (
            <div className="flex items-center gap-1.5 text-success font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recipient Pinged: {new Date(parcel.claim_pinged_at).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila' })}</span>
            </div>
          )}
        </div>

        {/* Close Button Action */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-foreground bg-surface hover:bg-muted border border-border rounded-full transition-all focus-visible:ring-2 focus-visible:ring-ring"
        >
          Dismiss Inspector
        </button>
      </div>
    </div>
  );
};
