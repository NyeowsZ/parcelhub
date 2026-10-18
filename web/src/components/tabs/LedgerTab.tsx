'use client';

import React, { useState } from 'react';
import { ParcelRow, EscrowLedgerRow, ParcelStatus } from '@/types/database';

interface LedgerTabProps {
  parcels: ParcelRow[];
  ledger: EscrowLedgerRow[];
}

export const LedgerTab: React.FC<LedgerTabProps> = ({ parcels }) => {
  const [filter, setFilter] = useState<'ALL' | ParcelStatus>('ALL');

  const filtered = parcels.filter((p) => {
    if (filter === 'ALL') return true;
    return p.current_status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Envelope Vault & Escrow Ledger</span>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              Audit Trail
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Physical envelope isolation audit log. Parcels map strictly to dedicated envelopes with zero shared float.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-muted p-1.5 rounded-full border border-border text-xs" role="group" aria-label="Parcel status filter">
          {(['ALL', 'STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              aria-label={`Filter ledger by ${tab} status`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                filter === tab
                  ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(217,38,26,0.3)]'
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
                <th scope="col" className="py-3.5 px-5">Waybill Number</th>
                <th scope="col" className="py-3.5 px-5">Recipient</th>
                <th scope="col" className="py-3.5 px-5">Carrier</th>
                <th scope="col" className="py-3.5 px-5 text-right">Cash Deposited</th>
                <th scope="col" className="py-3.5 px-5 text-right">Courier COD</th>
                <th scope="col" className="py-3.5 px-5 text-right">Change Due</th>
                <th scope="col" className="py-3.5 px-5 text-center">FSM State</th>
                <th scope="col" className="py-3.5 px-5">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-foreground">
              {filtered.map((p) => {
                const isClaimed = p.current_status === 'CLAIMED';
                const isReady = p.current_status === 'RECEIVED_LOGGED';
                const isFunded = p.current_status === 'FUNDED';

                return (
                  <tr key={p.parcel_id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-foreground">
                      {p.waybill_number}
                    </td>
                    <td className="py-4 px-5 font-sans">
                      <div className="font-semibold text-foreground">{p.recipient_name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.recipient_school_id}</div>
                    </td>
                    <td className="py-4 px-5 font-sans text-muted-foreground font-medium">
                      {p.carrier}
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-foreground">
                      ₱{p.cash_deposited.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-warning">
                      ₱{p.cod_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-success">
                      ₱{Math.max(0, p.change_due).toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-center font-sans">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
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
                    <td className="py-4 px-5 text-[11px] text-muted-foreground font-sans">
                      {new Date(p.updated_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
