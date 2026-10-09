'use client';

import React, { useState } from 'react';
import { ParcelRow } from '@/types/database';
import { Banknote, ShieldCheck, AlertTriangle, CheckCircle, Printer } from 'lucide-react';

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
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Physical Cash-In & Envelope Ledgering</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              State: STAGED → FUNDED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Accept physical bills from student, seal exact courier COD and change in an isolated envelope, and advance status to FUNDED.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">Invariant 1:</span>
          <span className="text-amber-400 font-bold uppercase tracking-wider">Zero-Credit Escrow</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Staged Parcels List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="terminal-card p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              1. Select Staged Consignment
            </h3>

            {stagedParcels.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">
                  No staged consignments awaiting funding right now.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
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
                      className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/30 shadow-md shadow-amber-950/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white">
                          {p.recipient_name || 'Student Consignment'}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {p.cod_amount > 0 ? `₱${p.cod_amount.toFixed(2)} COD` : 'Prepaid'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        Waybill: <span className="text-slate-200">{p.waybill_number}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Carrier: {p.carrier} · ID: {p.recipient_school_id || 'CTU-2024-8841'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cash Acceptance Form & Solvency Invariant (7 cols) */}
        <div className="lg:col-span-7">
          <div className="terminal-card p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              2. Accept Cash & Prepare Physical Envelope
            </h3>

            {!selectedParcel ? (
              <div className="p-12 text-center text-slate-500">
                <Banknote className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Select a staged consignment on the left to begin envelope funding.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Declared Consignment Details */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px]">Recipient</span>
                    <p className="text-white font-bold mt-0.5">{selectedParcel.recipient_name}</p>
                    <p className="text-slate-500 font-mono">{selectedParcel.recipient_school_id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px]">Declared Courier COD</span>
                    <p className="text-amber-400 font-mono font-bold text-sm mt-0.5">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </p>
                    <p className="text-slate-500">{selectedParcel.carrier}</p>
                  </div>
                </div>

                {/* Cash Deposited Input */}
                {!isPrepaid ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Physical Cash Handed by Student (₱)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white text-base font-mono font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-800/40 text-xs text-blue-300">
                    Prepaid shipment (₱0.00 COD). Desk staging records audit check-in with zero cash required.
                  </div>
                )}

                {/* Envelope Change Calculation */}
                {!isPrepaid && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Exact Courier COD:</span>
                      <span className="font-mono text-white">₱{selectedParcel.cod_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-bold">
                      <span className="text-emerald-400">Pre-Calculated Change Enclosed:</span>
                      <span className="text-base font-mono text-emerald-400">
                        ₱{Math.max(0, changeDue).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Solvency Invariant Error Warning */}
                {!isPrepaid && numDeposit < selectedParcel.cod_amount && depositAmount !== '' && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <div>
                      <strong>Solvency Invariant Violation:</strong> Counter cannot accept cash deposit less than declared courier COD (₱{selectedParcel.cod_amount.toFixed(2)}). The hub never fronts money.
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!isValidSolvent || submitting}
                    className="flex-1 py-3.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-102 active:scale-98"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Envelope & Shift to FUNDED</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
