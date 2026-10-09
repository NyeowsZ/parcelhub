'use client';

import React, { useState } from 'react';
import { ParcelRow } from '@/types/database';
import { Banknote, ShieldCheck, AlertTriangle, CheckCircle, Lock, Sparkles, UserCheck } from 'lucide-react';
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
      <div className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <span>Physical Cash-In & Desk Funding Gate</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              State: STAGED → FUNDED
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accept physical cash from student, seal exact courier COD in an isolated envelope, and advance status to FUNDED.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-600">Invariant 3:</span>
            <span className="text-amber-800 font-extrabold uppercase text-[10px]">Client Ping Required</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold">
            <span className="text-slate-600">Operator:</span>
            <span className="text-blue-700 font-mono font-bold text-[11px]">{staffSession?.staffId || 'STAFF-0488'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Staged Parcels List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="surface-card p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              1. Select Staged Consignment
            </h3>

            {stagedParcels.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-600">
                  No staged consignments awaiting funding right now.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  When students pre-register parcels via the mobile client, they appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stagedParcels.map((p) => {
                  const isSelected = p.parcel_id === selectedParcelId;
                  const isPinged = Boolean(p.payment_pinged_at);

                  return (
                    <button
                      key={p.parcel_id}
                      onClick={() => {
                        if (isPinged) {
                          setSelectedParcelId(p.parcel_id);
                          setDepositAmount(p.cod_amount > 0 ? p.cod_amount.toString() : '0');
                        }
                      }}
                      disabled={!isPinged}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        !isPinged
                          ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {p.waybill_number}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isPinged ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              PING RECEIVED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              LOCKED (AWAITING SCAN)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{p.recipient_name || 'Student Consignment'}</span>
                        <span className="font-semibold text-slate-800">
                          {p.cod_amount === 0 ? 'Prepaid (₱0)' : `COD: ₱${p.cod_amount.toFixed(2)}`}
                        </span>
                      </div>

                      {!isPinged && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-2 font-medium">
                          ⚠ Invariant: Student must scan Station QR or enter Hub ID on mobile before staff can interact.
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
          <div className="surface-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              2. Accept Cash Deposit & Seal Envelope
            </h3>

            {!selectedParcel ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Banknote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  Select a pinged consignment from the left to accept cash.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only consignments where the student has scanned the Station QR or pinged the desk are unlocked.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Consignment Target Overview */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Selected Consignment
                    </span>
                    <p className="font-mono font-bold text-sm text-[#0F172A] mt-0.5">
                      {selectedParcel.waybill_number}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Recipient: <strong>{selectedParcel.recipient_name || 'Student Recipient'}</strong> ({selectedParcel.carrier})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Required COD
                    </span>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Cash Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Physical Cash Handed by Student (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-slate-400 font-mono">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="1"
                      min={selectedParcel.cod_amount}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={selectedParcel.cod_amount.toString()}
                      disabled={isPrepaid}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {isPrepaid && (
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
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
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                        >
                          Exact ₱{amt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Change Calculation Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Courier COD Budget (to be sealed in envelope):</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Cash Handed:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₱{numDeposit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold">
                    <span className="text-slate-900">Change to return to student at claim:</span>
                    <span className={`text-base font-mono ${changeDue >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ₱{Math.max(0, changeDue).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Solvency Warning if student gave less than COD */}
                {!isValidSolvent && !isPrepaid && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      <strong>Solvency Invariant Violation:</strong> Physical cash must be greater than or equal to COD (₱{selectedParcel.cod_amount.toFixed(2)}). Hub never fronts money.
                    </span>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={!isValidSolvent || submitting}
                  className="w-full h-12 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-40 text-white flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
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
