'use client';

import React from 'react';
import { useTerminal } from '@/context/TerminalContext';
import { StatCards } from '@/components/StatCards';
import { LedgerTab } from '@/components/tabs/LedgerTab';
import { useRouter } from 'next/navigation';

export default function LedgerPage() {
  const router = useRouter();
  const { parcels, setSelectedDetailParcel } = useTerminal();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Telemetry Stats */}
      <StatCards
        parcels={parcels}
        onNavigateToQueue={() => router.push('/queue')}
      />

      {/* Main Ledger Workspace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              Desk Function 04
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Envelope Vault & Audit Ledger
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            PoLP Compliance & Cryptographic Signatures
          </span>
        </div>

        <LedgerTab
          parcels={parcels}
          onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
        />
      </div>
    </div>
  );
}
