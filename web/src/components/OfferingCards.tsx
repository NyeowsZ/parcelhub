'use client';

import React from 'react';

interface OfferingCardsProps {
  onSelectModule: (mode: 'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER') => void;
  queueCount: number;
  intakeCount: number;
  cashInCount: number;
  ledgerCount: number;
}

export const OfferingCards: React.FC<OfferingCardsProps> = ({
  onSelectModule,
  queueCount,
  intakeCount,
  cashInCount,
  ledgerCount,
}) => {
  return (
    <section className="py-8 space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold uppercase tracking-widest">
          Terminal Capabilities
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1]">
          Four core operational workflows.
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
          Zero-credit escrow mechanics combined with automated Gemini AI vision inspection to ensure deterministic campus delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Capability 1: Claim Handshake */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectModule('QUEUE')}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelectModule('QUEUE'); }}
          aria-label="Launch Claim Handshake Queue"
          className="card-lift glass-card relative p-8 rounded-2xl bg-surface/80 dark:bg-surface/50 border border-border/80 hover:border-primary/40 transition-all duration-300 group cursor-pointer space-y-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* Crisp Pixel-Style Geometric SVG Icon */}
          <div className="text-primary transition-transform duration-300 group-hover:scale-110">
            <svg className="w-10 h-10" viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="5" y="1" width="2" height="1" />
              <rect x="4" y="2" width="4" height="1" />
              <rect x="3" y="3" width="6" height="1" />
              <rect x="2" y="4" width="8" height="1" />
              <rect x="3" y="5" width="6" height="1" />
              <rect x="4" y="6" width="4" height="1" />
              <rect x="5" y="7" width="2" height="1" />
              <rect x="5" y="9" width="2" height="2" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">01 / Handshake</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                {queueCount} Waiting
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Claim Handshake
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Counter verification and physical envelope change reconciliation for ready packages.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary transition-all duration-200 group-hover:gap-3.5">
              <span>Enter Queue</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Capability 2: Courier Intake */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectModule('INTAKE')}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelectModule('INTAKE'); }}
          aria-label="Launch Courier Arrival & AI Ingestion"
          className="card-lift glass-card relative p-8 rounded-2xl bg-surface/80 dark:bg-surface/50 border border-border/80 hover:border-primary/40 transition-all duration-300 group cursor-pointer space-y-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-primary transition-transform duration-300 group-hover:scale-110">
            <svg className="w-10 h-10" viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="2" y="2" width="8" height="1" />
              <rect x="2" y="3" width="1" height="6" />
              <rect x="9" y="3" width="1" height="6" />
              <rect x="2" y="9" width="8" height="1" />
              <rect x="5" y="5" width="2" height="2" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">02 / OCR Vision</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                {intakeCount} Funded
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Courier Intake & AI
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time camera inspection, Gemini OCR extraction, and exact courier payout disbursal.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary transition-all duration-200 group-hover:gap-3.5">
              <span>Inspect Waybill</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Capability 3: Cash In */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectModule('CASH_IN')}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelectModule('CASH_IN'); }}
          aria-label="Launch Cash-In & Envelopes"
          className="card-lift glass-card relative p-8 rounded-2xl bg-surface/80 dark:bg-surface/50 border border-border/80 hover:border-primary/40 transition-all duration-300 group cursor-pointer space-y-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-primary transition-transform duration-300 group-hover:scale-110">
            <svg className="w-10 h-10" viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="1" y="3" width="10" height="1" />
              <rect x="1" y="8" width="10" height="1" />
              <rect x="1" y="4" width="1" height="4" />
              <rect x="10" y="4" width="1" height="4" />
              <rect x="5" y="5" width="2" height="2" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">03 / Solvency</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                {cashInCount} Staged
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Cash-In & Envelopes
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Student COD deposit acceptance, physical envelope printing, and change tracking.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary transition-all duration-200 group-hover:gap-3.5">
              <span>Accept Cash</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Capability 4: Ledger & SLA */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectModule('LEDGER')}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelectModule('LEDGER'); }}
          aria-label="Launch Envelope Vault Ledger"
          className="card-lift glass-card relative p-8 rounded-2xl bg-surface/80 dark:bg-surface/50 border border-border/80 hover:border-primary/40 transition-all duration-300 group cursor-pointer space-y-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="text-primary transition-transform duration-300 group-hover:scale-110">
            <svg className="w-10 h-10" viewBox="0 0 12 12" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
              <rect x="2" y="1" width="8" height="2" />
              <rect x="2" y="5" width="8" height="2" />
              <rect x="2" y="9" width="8" height="2" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">04 / Audit</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                {ledgerCount} Total
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Vault & SLA Ledger
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cryptographically verified transaction history, envelope balance, and PoLP logs.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary transition-all duration-200 group-hover:gap-3.5">
              <span>Inspect Ledger</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M4 10h12M12 6l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
