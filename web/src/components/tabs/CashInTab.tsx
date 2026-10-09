'use client';

import React, { useState } from 'react';
import { ParcelRow } from '@/types/database';
import { Banknote, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

interface CashInTabProps {
  parcels: ParcelRow[];
  onCommitCashIn: (parcelId: string, cashDeposited: number) => void;
  onPrintEnvelope: (parcel: ParcelRow) => void;
}

export const CashInTab: React.FC<CashInTabProps> = ({
  parcels,
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

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onCommitCashIn(selectedParcel.parcel_id, isPrepaid ? 0 : numDeposit);
    setSubmitting(false);

    // Offer to print physical envelope label
    onPrintEnvelope({
      ...selectedParcel,
      cash_deposited: isPrepaid ? 0 : numDeposit,
      change_due: isPrepaid ? 0 : changeDue,
      current_status: 'FUNDED',
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
            <span>Physical Cash-In & Envelope Ledgering</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              State: STAGED → FUNDED
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accept physical cash from student, seal exact courier COD and change in an isolated envelope, and advance status to FUNDED.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-slate-600">Invariant 1:</span>
          <span className="text-amber-800 font-extrabold uppercase text-[10px]">Zero-Credit Escrow</span>
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
                  return (
                    <button
                      key={p.parcel_id}
                      onClick={() => {
                        setSelectedParcelId(p.parcel_id);
                        setDepositAmount(p.cod_amount > 0 ? String(p.cod_amount) : '0');
                      }}
                      className={`w-full p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold text-[#0F172A]">
                          {p.recipient_name || 'Student Consignment'}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {p.cod_amount > 0 ? `₱${p.cod_amount.toFixed(2)} COD` : 'Prepaid'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-1">
                        Waybill: <span className="text-slate-900 font-bold">{p.waybill_number}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Carrier: {p.carrier} · ID: {p.recipient_school_id || 'CTU-2024-8841'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cash Acceptance Form conforming to DESIGN_CONTEXT.md Section 5.1 & 5.2 */}
        <div className="lg:col-span-7">
          <div className="surface-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              2. Accept Cash & Prepare Physical Envelope
            </h3>

            {!selectedParcel ? (
              <div className="p-12 text-center text-slate-400">
                <Banknote className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-500" />
                <p className="text-xs font-medium">Select a staged consignment on the left to begin envelope funding.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Declared Consignment Details */}
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Recipient</span>
                    <p className="text-[#0F172A] font-bold text-sm mt-0.5">{selectedParcel.recipient_name}</p>
                    <p className="text-slate-500 font-mono">{selectedParcel.recipient_school_id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Declared Courier COD</span>
                    <p className="text-amber-700 font-mono font-extrabold text-base mt-0.5">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </p>
                    <p className="text-slate-500 font-medium">{selectedParcel.carrier}</p>
                  </div>
                </div>

                {/* Form Input Blueprint per DESIGN_CONTEXT.md Section 5.1 */}
                {!isPrepaid ? (
                  <div className="space-y-1.5 w-full">
                    <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider pl-3">
                      Physical Cash Handed by Student (₱)
                    </label>
                    <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3.5 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:shadow-sm border border-transparent">
                      <span className="text-slate-500 font-bold mr-2">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs text-blue-800 font-medium">
                    Prepaid shipment (₱0.00 COD). Desk staging records audit check-in with zero cash required.
                  </div>
                )}

                {/* Envelope Change Calculation */}
                {!isPrepaid && (
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Exact Courier COD:</span>
                      <span className="font-mono font-bold text-slate-900">₱{selectedParcel.cod_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold">
                      <span className="text-emerald-800">Pre-Calculated Change Enclosed:</span>
                      <span className="text-lg font-mono text-emerald-700 font-extrabold">
                        ₱{Math.max(0, changeDue).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Solvency Invariant Error Warning */}
                {!isPrepaid && numDeposit < selectedParcel.cod_amount && depositAmount !== '' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong>Solvency Invariant Violation:</strong> Counter cannot accept cash deposit less than declared courier COD (₱{selectedParcel.cod_amount.toFixed(2)}). The hub never fronts money.
                    </div>
                  </div>
                )}

                {/* Action CTA Button per DESIGN_CONTEXT.md Section 5.2 */}
                <button
                  type="submit"
                  disabled={!isValidSolvent || submitting}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white text-base font-semibold rounded-full shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Envelope & Shift to FUNDED</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
