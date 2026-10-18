'use client';

import React, { useState, useEffect } from 'react';
import { ParcelRow } from '@/types/database';
import { StaffSession } from '../StaffAuthModal';
import { Banknote, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

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
      alert('Violation of Invariant 3: Recipient must ping desk before staff can accept payment.');
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
      id="cash-in-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
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
            COD Escrow Deposit
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            Accept Cash & Print Envelope
          </h2>
          <p className="text-xs text-muted-foreground">
            Enforces Invariant 1 (Zero-Credit Escrow) & Invariant 3 (Payment Ping Gate).
          </p>
        </div>

        {/* Payment Ping Gate Status */}
        {!isPinged ? (
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/25 text-xs text-warning space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>Payment Gate Blocked (Invariant 3)</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Recipient has not pinged desk or scanned station QR. Payment cannot be accepted until recipient signals presence.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-success/10 border border-success/25 text-xs text-success space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Student Payment Ping Confirmed</span>
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Ping verified. Station authorized to accept cash deposit and seal physical vault envelope.
            </p>
          </div>
        )}

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
              COD Due Carrier
            </span>
            <span className="font-mono font-black text-primary text-base">₱{parcel.cod_amount.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Minimalist Underline Input (1:1 from references/feedback-dialogs.md lines 78-88) */}
          <div className="space-y-1">
            <label htmlFor="deposit-amount" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Cash Tendered by Student (PHP)
            </label>
            <input
              type="number"
              id="deposit-amount"
              name="amount"
              aria-label="Cash Tendered by Student in PHP"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isPrepaid}
              required
              placeholder="0.00"
              className="w-full bg-transparent border-0 border-b border-border py-2 text-sm text-foreground focus:border-b-2 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Denomination Quick Select Chips */}
          {!isPrepaid && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-muted-foreground mr-1">Quick Select:</span>
              <button
                type="button"
                onClick={() => setDepositAmount(parcel.cod_amount.toString())}
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                Exact COD (₱{parcel.cod_amount.toFixed(0)})
              </button>
              <button
                type="button"
                onClick={() => setDepositAmount('500')}
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                ₱500
              </button>
              <button
                type="button"
                onClick={() => setDepositAmount('1000')}
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                ₱1,000
              </button>
            </div>
          )}

          {/* Change Breakdown & Solvency Check */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Required COD Payout:</span>
              <span className="font-mono font-medium text-foreground">₱{parcel.cod_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Deposit Tendered:</span>
              <span className="font-mono font-medium text-foreground">₱{numDeposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border-subtle font-bold">
              <span className="text-foreground">Change Sealed in Physical Envelope:</span>
              <span className={`font-mono text-sm ${changeDue < 0 ? 'text-destructive' : 'text-primary'}`}>
                {changeDue < 0 ? `Deficit -₱${Math.abs(changeDue).toFixed(2)}` : `₱${changeDue.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Operator Stamp */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Teller: {staffSession?.staffId || 'STAFF-0488'}</span>
            </span>
            <span className="font-mono text-[10px]">Vault Envelope: #{parcel.parcel_id.slice(-4).toUpperCase()}</span>
          </div>

          {/* Action CTA Button (1:1 from references/feedback-dialogs.md lines 102-107) */}
          <button
            type="submit"
            disabled={!isPinged || !isValidSolvent || submitting}
            className="w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting ? 'Sealing Deposit...' : 'Confirm Cash Deposit & Print Envelope'}
          </button>
        </form>
      </div>
    </div>
  );
};
