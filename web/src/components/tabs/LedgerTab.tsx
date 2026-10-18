'use client';

import React, { useState } from 'react';
import { ParcelRow, ParcelStatus } from '@/types/database';
import { Eye } from 'lucide-react';

interface LedgerTabProps {
  parcels: ParcelRow[];
  onOpenDetailModal: (parcel: ParcelRow) => void;
}

export const LedgerTab: React.FC<LedgerTabProps> = ({ parcels, onOpenDetailModal }) => {
  const [filter, setFilter] = useState<'ALL' | ParcelStatus>('ALL');

  const filtered = parcels.filter((p) => {
    if (filter === 'ALL') return true;
    return p.current_status === filter;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="card-lift glass-card p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Envelope Vault & Escrow Ledger</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              Audit Trail
            </span>
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Physical envelope isolation audit log. Click any row to inspect complete PoLP timeline.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-full border border-border text-xs" role="group" aria-label="Parcel status filter">
          {(['ALL', 'STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              aria-label={`Filter ledger by ${tab} status`}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                filter === tab
                  ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(255,45,32,0.3)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
              }`}
            >
              {tab === 'ALL'
                ? 'All'
                : tab === 'RECEIVED_LOGGED'
                ? 'In Custody'
                : tab === 'FUNDED'
                ? 'Funded'
                : tab === 'STAGED'
                ? 'Staged'
                : 'Claimed'}
            </button>
          ))}
        </div>
      </div>

      {/* Parcels Table */}
      <div className="card-lift glass-card rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-[10px] uppercase font-semibold tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th scope="col" className="py-3 px-4">Waybill Number</th>
                <th scope="col" className="py-3 px-4">Recipient</th>
                <th scope="col" className="py-3 px-4">Carrier</th>
                <th scope="col" className="py-3 px-4 text-right">Cash Deposited</th>
                <th scope="col" className="py-3 px-4 text-right">Courier COD</th>
                <th scope="col" className="py-3 px-4 text-right">Change Due</th>
                <th scope="col" className="py-3 px-4 text-center">FSM State</th>
                <th scope="col" className="py-3 px-4 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-foreground">
              {filtered.map((p) => {
                const isClaimed = p.current_status === 'CLAIMED';
                const isReady = p.current_status === 'RECEIVED_LOGGED';
                const isFunded = p.current_status === 'FUNDED';

                return (
                  <tr
                    key={p.parcel_id}
                    onClick={() => onOpenDetailModal(p)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {p.waybill_number}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-foreground">{p.recipient_name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.recipient_school_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-muted-foreground font-medium">
                      {p.carrier}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                      ₱{p.cash_deposited.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-warning">
                      ₱{p.cod_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-success">
                      ₱{Math.max(0, p.change_due).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                          isClaimed
                            ? 'bg-muted text-muted-foreground border-border'
                            : isReady
                            ? 'bg-success-subtle text-success border-success/30'
                            : isFunded
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-warning-subtle text-warning border-warning/30'
                        }`}
                      >
                        {p.current_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetailModal(p);
                        }}
                        aria-label={`Inspect PoLP details for waybill ${p.waybill_number}`}
                        className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
