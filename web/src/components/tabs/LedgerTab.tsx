'use client';

import React, { useState } from 'react';
import { ParcelRow, EscrowLedgerRow, ParcelStatus } from '@/types/database';
import { ShieldCheck, History, CheckCircle, Clock } from 'lucide-react';

interface LedgerTabProps {
  parcels: ParcelRow[];
  ledger: EscrowLedgerRow[];
}

export const LedgerTab: React.FC<LedgerTabProps> = ({ parcels, ledger }) => {
  const [filter, setFilter] = useState<'ALL' | ParcelStatus>('ALL');

  const filtered = parcels.filter((p) => {
    if (filter === 'ALL') return true;
    return p.current_status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Envelope Vault & Escrow Ledger</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
              Audit Trail
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Physical envelope isolation audit log. Parcels map strictly to dedicated envelopes with zero shared float.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-full border border-slate-800 text-xs">
          {(['ALL', 'STAGED', 'FUNDED', 'RECEIVED_LOGGED', 'CLAIMED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
      <div className="terminal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Waybill Number</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4 text-right">Cash Deposited</th>
                <th className="py-3 px-4 text-right">Courier COD</th>
                <th className="py-3 px-4 text-right">Change Due</th>
                <th className="py-3 px-4 text-center">FSM State</th>
                <th className="py-3 px-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filtered.map((p) => {
                const isClaimed = p.current_status === 'CLAIMED';
                const isReady = p.current_status === 'RECEIVED_LOGGED';
                const isFunded = p.current_status === 'FUNDED';

                return (
                  <tr key={p.parcel_id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.waybill_number}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{p.recipient_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.recipient_school_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {p.carrier}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-200">
                      ₱{p.cash_deposited.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-400 font-bold">
                      ₱{p.cod_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                      ₱{Math.max(0, p.change_due).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isClaimed
                            ? 'bg-slate-800 text-slate-400'
                            : isReady
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isFunded
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.current_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
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
