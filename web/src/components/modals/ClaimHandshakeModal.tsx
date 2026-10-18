'use client';

import React, { useState } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { StaffSession } from '../StaffAuthModal';
import { X, CheckCircle2, Lock, ShieldCheck, UserCheck, Banknote } from 'lucide-react';

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
  visualLog,
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-handshake-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-lg bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-border space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close claim handshake dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="claim-handshake-title" className="text-xl font-extrabold text-foreground tracking-tight">
                Claim Handshake Handover
              </h2>
              {hasPing ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 animate-pulse">
                  MPIN Pinged
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                  Locked
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Atomic Handover Gate · Invariant 3 & PoLP Enforcement
            </p>
          </div>
        </div>

        {/* Status Verification Notice */}
        {!hasPing ? (
          <div className="p-4 rounded-2xl bg-warning-subtle border border-warning/30 text-xs text-warning space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Handshake Gate Locked</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Staff cannot release this parcel. The recipient must scan the Station QR and enter their 6-digit MPIN on mobile to authenticate the pickup handshake.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-success-subtle border border-success/30 text-xs text-success space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Student Authenticated at Desk</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Recipient entered MPIN at {new Date(parcel.claim_pinged_at!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Safe to hand over physical parcel and enclosed change.
            </p>
          </div>
        )}

        {/* Student & Parcel Information (PoLP) */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Recipient Student
              </span>
              <p className="text-base font-bold text-foreground mt-0.5">
                {parcel.recipient_name || 'Registered Recipient'}
              </p>
              <p className="text-xs font-mono text-primary font-semibold mt-0.5">
                {parcel.recipient_school_id || 'CTU-2024-8841'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Carrier
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {parcel.carrier}
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {parcel.waybill_number}
              </p>
            </div>
          </div>

          {/* Audit Attribution */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Visual Log: {visualLog ? 'Verified by Gemini' : 'Active'}</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Funded by: {parcel.payment_staff_id || 'STAFF-0488'}</span>
            </span>
          </div>
        </div>

        {/* Physical Cash Envelope Breakdown */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-primary" />
              <span>Envelope Ledger Reconciliation</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Isolated Float
            </span>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Cash Deposited by Student:</span>
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
              <span className="text-foreground">Change to Return with Parcel:</span>
              <span className="text-xl font-mono text-success font-extrabold">
                ₱{changeDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleCommitRelease}
            disabled={!hasPing || isSubmitting}
            aria-label={`Release parcel ${parcel.waybill_number} and disburse change`}
            className={`relative inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full text-xs font-semibold uppercase tracking-widest transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${
              hasPing && !isSubmitting
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98] shadow-[0_4px_16px_rgba(217,38,26,0.35)] cursor-pointer'
                : 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50'
            }`}
          >
            {hasPing && (
              <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            )}
            <CheckCircle2 className="relative z-10 w-4 h-4" />
            <span className="relative z-10">
              {isSubmitting
                ? 'Committing Release...'
                : hasPing
                ? `Release Parcel & Hand Over ₱${changeDue.toFixed(2)} Change`
                : 'Locked (Awaiting Student MPIN Ping)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel and close dialog"
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
