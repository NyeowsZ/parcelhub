'use client';

import React, { useState } from 'react';
import { ParcelRow, ParcelStatus } from '@/types/database';

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
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
      {/* Table Header Section (1:1 from references/layouts-tables.md lines 101-109) */}
      <div className="px-6 py-5 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Envelope Vault & SLA Ledger
          </h3>
          <p className="text-xs text-muted-foreground">
            Immutable physical envelope audit logs and cryptographic state verification.
          </p>
        </div>

        {/* Filter Pill Group (1:1 from references/buttons-inputs.md lines 135-155) */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Parcel status filter">
          {(['ALL', 'STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED'] as const).map((tab) => {
            const isSelected = filter === tab;
            const label =
              tab === 'ALL'
                ? 'All'
                : tab === 'RECEIVED_LOGGED'
                ? 'In Custody'
                : tab === 'FUNDED'
                ? 'Funded'
                : tab === 'STAGED'
                ? 'Staged'
                : 'Claimed';

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                aria-label={`Filter ledger by ${tab} status`}
                className={`px-3.5 py-1 text-xs font-medium uppercase tracking-wider rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? 'bg-foreground text-background font-semibold'
                    : 'bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container (1:1 from references/layouts-tables.md lines 111-150) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted text-muted-foreground border-b border-border-subtle font-semibold uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Consignment Waybill</th>
              <th scope="col" className="px-6 py-3.5">Recipient Student</th>
              <th scope="col" className="px-6 py-3.5">Carrier</th>
              <th scope="col" className="px-6 py-3.5 text-right">Cash Deposited</th>
              <th scope="col" className="px-6 py-3.5 text-right">Courier COD</th>
              <th scope="col" className="px-6 py-3.5 text-right">Envelope Change</th>
              <th scope="col" className="px-6 py-3.5 text-center">State</th>
              <th scope="col" className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-foreground">
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
                  <td className="px-6 py-4 font-mono font-bold text-foreground flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isClaimed
                          ? 'bg-muted-foreground'
                          : isReady
                          ? 'bg-primary'
                          : isFunded
                          ? 'bg-foreground'
                          : 'bg-warning'
                      }`}
                    />
                    <span>{p.waybill_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{p.recipient_name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{p.recipient_school_id}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    {p.carrier || 'Courier'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold">
                    ₱{p.cash_deposited.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                    ₱{p.cod_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                    ₱{Math.max(0, p.change_due).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-block ${
                        isClaimed
                          ? 'bg-muted text-muted-foreground border border-border'
                          : isReady
                          ? 'bg-primary/10 text-primary border border-primary/25'
                          : isFunded
                          ? 'bg-surface border border-border text-foreground'
                          : 'bg-warning/10 text-warning border border-warning/25'
                      }`}
                    >
                      {p.current_status.replace('_LOGGED', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary group-hover:underline">
                      <span>Inspect</span>
                      <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
