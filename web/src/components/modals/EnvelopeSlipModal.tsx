'use client';

import React from 'react';
import { ParcelRow } from '@/types/database';
import { Printer } from 'lucide-react';

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
      id="envelope-slip-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <div className="w-full max-w-sm p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
        {/* Close Button (1:1 from references/feedback-dialogs.md lines 57-65) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="no-print absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Stack (1:1 from references/feedback-dialogs.md lines 67-75) */}
        <div className="space-y-1 no-print">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Vault Document
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            Envelope Slip
          </h2>
          <p className="text-xs text-muted-foreground">
            Print and insert into physical cash envelope #{parcel.parcel_id.slice(-4).toUpperCase()}.
          </p>
        </div>

        {/* Printable Envelope Slip Content */}
        <div className="space-y-4 bg-surface p-6 rounded-2xl border border-border print:border-none print:p-0">
          <div className="border-b-2 border-foreground pb-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              ParcelHub Escrow Envelope
            </span>
            <h3 className="text-base font-extrabold text-foreground mt-1">
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
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recipient</span>
                <p className="font-bold text-foreground truncate">{parcel.recipient_name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Carrier</span>
                <p className="font-bold text-foreground">{parcel.carrier || 'Courier'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-border space-y-1 font-mono">
              <div className="flex justify-between">
                <span>COD Due:</span>
                <span className="font-bold">₱{parcel.cod_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposited:</span>
                <span className="font-bold">₱{parcel.cash_deposited.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary font-bold">
                <span>Change In Envelope:</span>
                <span>₱{Math.max(0, parcel.change_due).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="no-print w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Printer className="w-4 h-4" />
          <span>Print Slip</span>
        </button>
      </div>
    </div>
  );
};
