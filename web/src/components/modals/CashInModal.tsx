'use client';

import React, { useState, useEffect } from 'react';
import { ParcelRow } from '@/types/database';
import { StaffSession } from '../StaffAuthModal';
import { X, Banknote, ShieldCheck, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

interface CashInModalProps {
  parcel: ParcelRow | null;
  isOpen: boolean;
  onClose: () => void;
  staffSession: StaffSession | null;
  onCommitCashIn: (parcelId: string, cashDeposited: number, staffId: string) => void;
  onPrintEnvelope: (parcel: ParcelRow) => void;
}

export const CashInModal: React.FC<CashInModalProps> = ({
  parcel,
  isOpen,
  onClose,
  staffSession,
  onCommitCashIn,
  onPrintEnvelope,
}) => {
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (parcel) {
      setDepositAmount(parcel.cod_amount > 0 ? parcel.cod_amount.toString() : '0');
    }
  }, [parcel]);

  if (!isOpen || !parcel) return null;

  const isPinged = Boolean(parcel.payment_pinged_at);
  const numDeposit = parseFloat(depositAmount) || 0;
  const isPrepaid = parcel.cod_amount === 0;
  const isValidSolvent = isPrepaid || numDeposit >= parcel.cod_amount;
  const changeDue = numDeposit - parcel.cod_amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSolvent || submitting) return;

    if (!isPinged) {
      alert('Violation of Invariant 3: Student must scan Station QR or ping desk from mobile before staff can accept payment.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const activeStaffId = staffSession?.staffId || 'STAFF-0488';
    onCommitCashIn(parcel.parcel_id, isPrepaid ? 0 : numDeposit, activeStaffId);
    setSubmitting(false);

    onPrintEnvelope({
      ...parcel,
      cash_deposited: isPrepaid ? 0 : numDeposit,
      change_due: isPrepaid ? 0 : changeDue,
      current_status: 'FUNDED',
      payment_staff_id: activeStaffId,
      payment_station_code: 'CTU-DANAO-MAIN-HUB',
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cash-in-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-lg bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-border space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cash-in dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="cash-in-title" className="text-xl font-extrabold text-foreground tracking-tight">
                Cash Deposit & Envelope Sealing
              </h2>
              {isPinged ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 animate-pulse">
                  Payment Ping Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                  Scan Required
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Zero-Credit Escrow Gate · Invariant 1 & 3 Enforcement
            </p>
          </div>
        </div>

        {/* Invariant Gate Verification */}
        {!isPinged ? (
          <div className="p-4 rounded-2xl bg-warning-subtle border border-warning/30 text-xs text-warning space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Counter Payment Gate Locked</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Student has not scanned the Station QR poster or sent a counter payment ping from mobile. Staff cannot accept cash for unpinged consignments.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-success-subtle border border-success/30 text-xs text-success space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Station QR Scan Authenticated</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Student checked in at counter. Accept physical cash, verify solvency, and seal exact COD in isolated envelope.
            </p>
          </div>
        )}

        {/* Target Consignment Header */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Target Consignment
              </span>
              <p className="font-mono font-bold text-base text-foreground mt-0.5">
                {parcel.waybill_number}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {parcel.recipient_name || 'Student Recipient'} · {parcel.carrier}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Required COD Amount
              </span>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                ₱{parcel.cod_amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cash Input */}
          <div className="space-y-1.5">
            <label htmlFor="cash-in-deposit-input" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Physical Cash Handed by Student (PHP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground font-mono">
                ₱
              </span>
              <input
                id="cash-in-deposit-input"
                aria-label="Physical cash deposit amount in PHP"
                type="number"
                step="1"
                min={parcel.cod_amount}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={parcel.cod_amount.toString()}
                disabled={isPrepaid}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-surface-elevated border border-border text-base font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
            {isPrepaid && (
              <p className="text-[11px] text-success mt-1 font-medium">
                This order is prepaid by sender. No cash deposit required.
              </p>
            )}
          </div>

          {/* Quick denomination buttons */}
          {!isPrepaid && (
            <div className="flex flex-wrap gap-2">
              {[parcel.cod_amount, 500, 1000].map((amt) => {
                if (amt < parcel.cod_amount) return null;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    aria-label={`Select exact amount of ${amt} pesos`}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted hover:bg-surface-elevated text-foreground border border-border active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Exact ₱{amt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Envelope Allocation Breakdown */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Courier COD Budget (to be sealed in envelope):</span>
              <span className="font-mono font-bold text-foreground">
                ₱{parcel.cod_amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Cash Handed:</span>
              <span className="font-mono font-bold text-foreground">
                ₱{numDeposit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-border font-bold">
              <span className="text-foreground">Change due to return to student at claim:</span>
              <span className={`text-base font-mono ${changeDue >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₱{Math.max(0, changeDue).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Solvency Warning if student gave less than COD */}
          {!isValidSolvent && !isPrepaid && (
            <div className="p-4 rounded-2xl bg-destructive-subtle border border-destructive/30 text-destructive text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-destructive" />
              <span>
                <strong>Solvency Invariant Violation:</strong> Physical cash must be greater than or equal to COD (₱{parcel.cod_amount.toFixed(2)}). Hub never fronts money.
              </span>
            </div>
          )}

          {/* Submit Action */}
          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={!isValidSolvent || submitting || !isPinged}
              aria-label="Commit payment accept and seal envelope"
              className="relative inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40 shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
            >
              <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <CheckCircle className="relative z-10 w-4 h-4" />
              <span className="relative z-10">
                {submitting
                  ? 'Sealing Envelope...'
                  : !isPinged
                  ? 'Locked (Awaiting Station Scan)'
                  : `Commit Acceptance (₱${numDeposit.toFixed(2)}) & Print Label`}
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
        </form>
      </div>
    </div>
  );
};
