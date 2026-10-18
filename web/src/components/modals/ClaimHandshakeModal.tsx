'use client';

import React, { useState } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { StaffSession } from '../StaffAuthModal';
import { CheckCircle2, Lock, ShieldCheck, Banknote } from 'lucide-react';

interface ClaimHandshakeModalProps {
  parcel: ParcelRow | null;
  visualLog?: VisualLogRow;
  isOpen: boolean;
  onClose: () => void;
  onExecuteClaim: (parcelId: string, staffId: string) => void;
  staffSession: StaffSession | null;
}

export const ClaimHandshakeModal: React.FC<ClaimHandshakeModalProps> = ({
  parcel,
  isOpen,
  onClose,
  onExecuteClaim,
  staffSession,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !parcel) return null;

  const hasPing = Boolean(parcel.claim_pinged_at);
  const changeDue = Math.max(0, parcel.change_due);

  const handleCommitRelease = async () => {
    if (!hasPing || isSubmitting) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onExecuteClaim(parcel.parcel_id, staffSession?.staffId || 'STAFF-0488');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      id="claim-handshake-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
        {/* Close Button (1:1 from references/feedback-dialogs.md line 57-65) */}
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
            Handshake Handover
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            Release Consignment
          </h2>
          <p className="text-xs text-muted-foreground">
            Zero-credit physical envelope change breakdown & atomic student authentication.
          </p>
        </div>

        {/* Status Verification Notice */}
        {!hasPing ? (
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/25 text-xs text-warning space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Handshake Gate Locked</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Staff cannot release this parcel. The recipient must scan the Station QR and enter their 6-digit MPIN on mobile to authenticate the pickup handshake.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-success/10 border border-success/25 text-xs text-success space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Student Authenticated at Desk</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Identity verified via mobile MPIN challenge ping. Ready for physical consignment release.
            </p>
          </div>
        )}

        {/* Consignment Overview Card */}
        <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
                Recipient
              </span>
              <span className="text-sm font-bold text-foreground">
                {parcel.recipient_name}
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {parcel.carrier || 'Standard Courier'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                Tracking Waybill
              </span>
              <span className="font-mono font-bold text-foreground">
                {parcel.waybill_number}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                Shelf Location
              </span>
              <span className="font-mono font-bold text-primary">
                BAY-1A
              </span>
            </div>
          </div>
        </div>

        {/* Change Breakdown & Physical Envelope Reconciliation */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-primary" />
              <span>Physical Envelope Reconciliation</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-foreground">
              Envelope #{parcel.parcel_id.slice(-4).toUpperCase()}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>COD Amount Paid to Courier:</span>
              <span className="font-mono font-medium text-foreground">
                ₱{parcel.cod_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pre-funded Deposit from Student:</span>
              <span className="font-mono font-medium text-foreground">
                ₱{parcel.cash_deposited.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-subtle font-bold text-sm">
              <span className="text-foreground">Change Due in Cash Envelope:</span>
              <span className="font-mono text-primary text-base">
                ₱{changeDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Staff Operator Identity Footer */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Staff: {staffSession?.staffId || 'STAFF-0488'}</span>
          </span>
          <span className="font-mono text-[10px]">Station: CTU-DANAO</span>
        </div>

        {/* Actions (1:1 from references/feedback-dialogs.md line 102-107) */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={!hasPing || isSubmitting}
            onClick={handleCommitRelease}
            className="w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSubmitting ? 'Recording Handshake...' : 'Confirm Release & Handover Parcel'}
          </button>
        </div>
      </div>
    </div>
  );
};
