'use client';

import React from 'react';
import { ParcelRow } from '@/types/database';
import { X, Printer } from 'lucide-react';

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
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="envelope-slip-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-sm bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-border">
        {/* Close Button (no print) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close envelope slip modal"
          className="no-print absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Envelope Slip Content */}
        <div className="space-y-4 pt-1">
          <div className="border-b-2 border-foreground pb-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              ParcelHub Escrow Envelope
            </span>
            <h3 id="envelope-slip-title" className="text-base font-extrabold text-foreground mt-1">
              CTU DANAO TERMINAL
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Waybill</span>
              <p className="font-mono font-bold text-base text-foreground mt-0.5">
                {parcel.waybill_number}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Carrier</span>
                <p className="font-semibold text-foreground">{parcel.carrier}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recipient</span>
                <p className="font-semibold text-foreground">{parcel.recipient_name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{parcel.recipient_school_id}</p>
              </div>
            </div>
          </div>

          {/* Cash breakdown inside envelope */}
          <div className="bg-surface-elevated p-4 rounded-2xl space-y-2 text-xs border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cash Deposited:</span>
              <span className="font-mono font-bold text-foreground">₱{parcel.cash_deposited.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
              <span>Courier COD Payable:</span>
              <span className="font-mono text-warning">₱{parcel.cod_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
              <span className="text-success">Change Due Recipient:</span>
              <span className="font-mono text-success">₱{Math.max(0, parcel.change_due).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground font-mono">
            Status: FUNDED · Station: CTU-DANAO-MAIN-HUB
          </p>
        </div>

        {/* Action Buttons (no print) */}
        <div className="no-print mt-6 flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print envelope slip label"
            className="relative inline-flex items-center justify-center gap-2 flex-1 py-3 px-5 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <Printer className="relative z-10 w-4 h-4" />
            <span className="relative z-10">Print Slip</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close envelope slip modal"
            className="px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted hover:bg-surface-elevated text-foreground border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
