'use client';

import React from 'react';
import { useTerminal } from '@/context/TerminalContext';
import { StatCards } from '@/components/StatCards';
import { QueueTab } from '@/components/tabs/QueueTab';
import { useRouter } from 'next/navigation';

export default function QueuePage() {
  const router = useRouter();
  const {
    parcels,
    visualLogs,
    setSelectedClaimParcel,
    setSelectedDetailParcel,
    executeClaim,
    staffSession,
  } = useTerminal();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Telemetry Stats */}
      <StatCards
        parcels={parcels}
        onNavigateToQueue={() => router.push('/queue')}
      />

      {/* Main Queue Workspace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              Desk Function 01
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Claim Handshake Queue
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Station Gate: Invariant 3 Required
          </span>
        </div>

        <QueueTab
          parcels={parcels}
          visualLogs={visualLogs}
          onOpenClaimModal={(p) => setSelectedClaimParcel(p)}
          onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
          onBatchExecuteClaim={(ids) => executeClaim(ids, staffSession?.staffId || 'STAFF-0488')}
        />
      </div>
    </div>
  );
}
