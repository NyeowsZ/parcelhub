'use client';

import React from 'react';
import { useTerminal } from '@/context/TerminalContext';
import { StatCards } from '@/components/StatCards';
import { CashInTab } from '@/components/tabs/CashInTab';
import { useRouter } from 'next/navigation';

export default function CashInPage() {
  const router = useRouter();
  const { parcels, setSelectedCashInParcel, setSelectedDetailParcel } = useTerminal();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Telemetry Stats */}
      <StatCards
        parcels={parcels}
        onNavigateToQueue={() => router.push('/queue')}
      />

      {/* Main Cash-In Workspace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              Desk Function 03
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Physical Cash-In & Envelopes
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Invariant 1: Zero-Credit Solvency Enforcement
          </span>
        </div>

        <CashInTab
          parcels={parcels}
          onOpenCashInModal={(p) => setSelectedCashInParcel(p)}
          onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
        />
      </div>
    </div>
  );
}
