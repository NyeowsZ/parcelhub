'use client';

import React, { useState } from 'react';
import { ParcelRow } from '@/types/database';
import { Banknote, ShieldCheck, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { StaffSession } from '../StaffAuthModal';

interface CashInTabProps {
  parcels: ParcelRow[];
  staffSession: StaffSession | null;
  onCommitCashIn: (parcelId: string, cashDeposited: number, staffId: string) => void;
  onPrintEnvelope: (parcel: ParcelRow) => void;
}

export const CashInTab: React.FC<CashInTabProps> = ({
  parcels,
  staffSession,
  onCommitCashIn,
  onPrintEnvelope,
}) => {
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Eligible parcels are those in STAGED status awaiting physical deposit
  const stagedParcels = parcels.filter((p) => p.current_status === 'STAGED');
  const selectedParcel = parcels.find((p) => p.parcel_id === selectedParcelId);

  const numDeposit = parseFloat(depositAmount) || 0;
  const isPrepaid = selectedParcel ? selectedParcel.cod_amount === 0 : false;
  const isValidSolvent = selectedParcel
    ? isPrepaid || numDeposit >= selectedParcel.cod_amount
    : false;
  const changeDue = selectedParcel ? numDeposit - selectedParcel.cod_amount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel || !isValidSolvent) return;

    // Strict Invariant: Cannot interact or fund without client payment ping
    if (!selectedParcel.payment_pinged_at) {
      alert('Violation of Invariant 3: Student must scan Station QR or ping desk from mobile before staff can accept payment.');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const activeStaffId = staffSession?.staffId || 'STAFF-0488';
    onCommitCashIn(selectedParcel.parcel_id, isPrepaid ? 0 : numDeposit, activeStaffId);
    setSubmitting(false);

    // Offer to print physical envelope label
    onPrintEnvelope({
      ...selectedParcel,
      cash_deposited: isPrepaid ? 0 : numDeposit,
      change_due: isPrepaid ? 0 : changeDue,
      current_status: 'FUNDED',
      payment_staff_id: activeStaffId,
      payment_station_code: 'CTU-DANAO-MAIN-HUB',
    });

    setSelectedParcelId('');
    setDepositAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Physical Cash-In & Desk Funding Gate</span>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-warning-subtle text-warning border border-warning/30">
              State: STAGED → FUNDED
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Accept physical cash from student, seal exact courier COD in an isolated envelope, and advance status to FUNDED.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full border border-border text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-warning" />
            <span className="text-muted-foreground">Invariant 3:</span>
            <span className="text-warning font-extrabold uppercase text-[10px]">Client Ping Required</span>
          </div>

          <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full border border-border text-xs font-semibold">
            <span className="text-muted-foreground">Operator:</span>
            <span className="text-foreground font-mono font-bold text-[11px]">{staffSession?.staffId || 'STAFF-0488'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Staged Parcels List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              1. Select Staged Consignment
            </h3>

            {stagedParcels.length === 0 ? (
              <div className="p-8 text-center bg-muted/40 rounded-2xl border border-border">
                <p className="text-xs font-semibold text-foreground">
                  No staged consignments awaiting funding right now.
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  When students pre-register parcels via the mobile client, they appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stagedParcels.map((p) => {
                  const isSelected = p.parcel_id === selectedParcelId;
                  const isPinged = Boolean(p.payment_pinged_at);

                  return (
                    <button
                      key={p.parcel_id}
                      type="button"
                      onClick={() => {
                        if (isPinged) {
                          setSelectedParcelId(p.parcel_id);
                          setDepositAmount(p.cod_amount > 0 ? p.cod_amount.toString() : '0');
                        }
                      }}
                      disabled={!isPinged}
                      aria-label={`Select staged consignment ${p.waybill_number}`}
                      className={`w-full text-left p-4 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        !isPinged
                          ? 'opacity-60 bg-muted/30 border-border cursor-not-allowed'
                          : isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                          : 'border-border hover:border-primary/40 bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {p.waybill_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isPinged ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-success-subtle text-success border border-success/30 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-success" />
                              PING ACTIVE
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              LOCKED (SCAN REQ)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{p.recipient_name || 'Student Consignment'}</span>
                        <span className="font-semibold text-foreground">
                          {p.cod_amount === 0 ? 'Prepaid (₱0)' : `COD: ₱${p.cod_amount.toFixed(2)}`}
                        </span>
                      </div>

                      {!isPinged && (
                        <p className="text-[10px] text-warning bg-warning-subtle/50 px-2.5 py-1 rounded-xl mt-2 font-medium border border-warning/20">
                          ⚠ Invariant: Student must scan Station QR or enter Hub ID on mobile before staff can accept payment.
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cash Input & Escrow Allocation (7 cols) */}
        <div className="lg:col-span-7">
          <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              2. Accept Cash Deposit & Seal Envelope
            </h3>

            {!selectedParcel ? (
              <div className="p-12 text-center bg-muted/40 rounded-2xl border border-dashed border-border">
                <Banknote className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-foreground">
                  Select a pinged consignment from the left to accept cash.
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Only consignments where the student has scanned the Station QR or pinged the desk are unlocked.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Consignment Target Overview */}
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Selected Consignment
                    </span>
                    <p className="font-mono font-bold text-sm text-foreground mt-0.5">
                      {selectedParcel.waybill_number}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Recipient: <strong>{selectedParcel.recipient_name || 'Student Recipient'}</strong> ({selectedParcel.carrier})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Required COD
                    </span>
                    <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Cash Input */}
                <div className="space-y-1.5">
                  <label htmlFor="cash-deposit-amount" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Physical Cash Handed by Student (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground font-mono">
                      ₱
                    </span>
                    <input
                      id="cash-deposit-amount"
                      aria-label="Physical Cash Handed by Student in PHP"
                      type="number"
                      step="1"
                      min={selectedParcel.cod_amount}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={selectedParcel.cod_amount.toString()}
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
                    {[selectedParcel.cod_amount, 500, 1000].map((amt) => {
                      if (amt < selectedParcel.cod_amount) return null;
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

                {/* Change Calculation Breakdown */}
                <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Courier COD Budget (to be sealed in envelope):</span>
                    <span className="font-mono font-bold text-foreground">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash Handed:</span>
                    <span className="font-mono font-bold text-foreground">
                      ₱{numDeposit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-border font-bold">
                    <span className="text-foreground">Change to return to student at claim:</span>
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
                      <strong>Solvency Invariant Violation:</strong> Physical cash must be greater than or equal to COD (₱{selectedParcel.cod_amount.toFixed(2)}). Hub never fronts money.
                    </span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={!isValidSolvent || submitting}
                  aria-label="Commit payment accept and seal envelope"
                  className="relative inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40 shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
                >
                  <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <CheckCircle className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">
                    {submitting
                      ? 'Sealing Envelope & Ledgering...'
                      : `Commit Payment Accept (₱${numDeposit.toFixed(2)}) & Print Label`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
