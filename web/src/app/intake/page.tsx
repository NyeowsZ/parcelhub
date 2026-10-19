'use client';

import React from 'react';
import { useTerminal } from '@/context/TerminalContext';
import { StatCards } from '@/components/StatCards';
import { IntakeTab } from '@/components/tabs/IntakeTab';
import { useRouter } from 'next/navigation';

export default function IntakePage() {
  const router = useRouter();
  const { parcels, setSelectedIntakeParcel, setSelectedDetailParcel } = useTerminal();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Telemetry Stats */}
      <StatCards
        parcels={parcels}
        onNavigateToQueue={() => router.push('/queue')}
      />

      {/* Main Intake Workspace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              Desk Function 02
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Courier Arrival & AI Vision Ingestion
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Invariant 2: Pre-funded COD Envelopes Only
          </span>
        </div>

        <IntakeTab
          parcels={parcels}
          onOpenIntakeModal={(p) => setSelectedIntakeParcel(p)}
          onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
        />
      </div>
    </div>
  );
}
