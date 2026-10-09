'use client';

import React from 'react';
import { ParcelRow } from '@/types/database';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface EnvelopeSlipModalProps {
  parcel: ParcelRow | null;
  onClose: () => void;
}

export const EnvelopeSlipModal: React.FC<EnvelopeSlipModalProps> = ({
  parcel,
  onClose,
}) => {
  if (!parcel) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200">
        {/* Close Button (no print) */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Envelope Slip Content */}
        <div className="space-y-4 pt-1">
          <div className="border-b-2 border-slate-900 pb-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
              ParcelHub Escrow Envelope
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              CTU DANAO TERMINAL
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Waybill</span>
              <p className="font-mono font-bold text-base text-slate-900 mt-0.5">
                {parcel.waybill_number}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Carrier</span>
                <p className="font-semibold text-slate-800">{parcel.carrier}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Recipient</span>
                <p className="font-semibold text-slate-800">{parcel.recipient_name}</p>
                <p className="text-[10px] font-mono text-slate-500">{parcel.recipient_school_id}</p>
              </div>
            </div>
          </div>

          {/* Cash breakdown inside envelope */}
          <div className="bg-slate-100 p-4 rounded-2xl space-y-2 text-xs border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-600">Cash Deposited:</span>
              <span className="font-mono font-bold text-slate-900">₱{parcel.cash_deposited.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
              <span>Courier COD Payable:</span>
              <span className="font-mono text-amber-700">₱{parcel.cod_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
              <span className="text-emerald-700">Change Due Recipient:</span>
              <span className="font-mono text-emerald-700">₱{Math.max(0, parcel.change_due).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 font-mono">
            Status: FUNDED · Station: CTU-DANAO-MAIN-HUB
          </p>
        </div>

        {/* Action Buttons (no print) */}
        <div className="no-print mt-6 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Envelope Slip</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
