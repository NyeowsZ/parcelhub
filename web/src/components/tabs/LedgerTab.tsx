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
      <div className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <span>Envelope Vault & Escrow Ledger</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              Audit Trail
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Physical envelope isolation audit log. Parcels map strictly to dedicated envelopes with zero shared float.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-full border border-slate-200 text-xs">
          {(['ALL', 'STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Waybill Number</th>
                <th className="py-3.5 px-4 font-semibold">Recipient</th>
                <th className="py-3.5 px-4 font-semibold">Carrier</th>
                <th className="py-3.5 px-4 text-right font-semibold">Cash Deposited</th>
                <th className="py-3.5 px-4 text-right font-semibold">Courier COD</th>
                <th className="py-3.5 px-4 text-right font-semibold">Change Due</th>
                <th className="py-3.5 px-4 text-center font-semibold">FSM State</th>
                <th className="py-3.5 px-4 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filtered.map((p) => {
                const isClaimed = p.current_status === 'CLAIMED';
                const isReady = p.current_status === 'RECEIVED_LOGGED';
                const isFunded = p.current_status === 'FUNDED';

                return (
                  <tr key={p.parcel_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {p.waybill_number}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-[#0F172A]">{p.recipient_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.recipient_school_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 font-medium">
                      {p.carrier}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-700 font-semibold">
                      ₱{p.cash_deposited.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-700 font-bold">
                      ₱{p.cod_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">
                      ₱{Math.max(0, p.change_due).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                          isClaimed
                            ? 'bg-slate-100 text-slate-600'
                            : isReady
                            ? 'bg-emerald-100 text-emerald-800'
                            : isFunded
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.current_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-sans">
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
