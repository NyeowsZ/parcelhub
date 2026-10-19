'use client';

import React, { useState, useEffect } from 'react';
import { useTerminal } from '@/context/TerminalContext';
import { usePathname } from 'next/navigation';
import { Clock, Cpu, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    parcels,
    config,
    simulateClaimPing,
    simulatePaymentPing,
    toggleUserReceiptAi,
    toggleStaffIntakeAi,
  } = useTerminal();

  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Manila',
        }) + ' PHT'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageMeta = () => {
    switch (pathname) {
      case '/':
      case '/queue':
        const waiting = parcels.filter((p) => p.current_status === 'RECEIVED_LOGGED' && p.claim_pinged_at).length;
        return {
          title: 'Claim Handshake Queue',
          description: waiting > 0 ? `${waiting} student(s) waiting at counter` : 'Listening for student arrival scan',
        };
      case '/intake':
        const funded = parcels.filter((p) => p.current_status === 'FUNDED').length;
        return {
          title: 'Courier Arrival & AI Vision',
          description: `${funded} funded envelope(s) ready for courier payout`,
        };
      case '/cash-in':
        const staged = parcels.filter((p) => p.current_status === 'STAGED').length;
        return {
          title: 'Cash-In & Envelopes',
          description: `${staged} pre-registered parcel(s) awaiting cash deposit`,
        };
      case '/ledger':
        return {
          title: 'Envelope Vault & SLA Ledger',
          description: 'Cryptographic immutable state & escrow solvency records',
        };
      case '/settings':
        return {
          title: 'System & Station Hub',
          description: 'Station poster, AI vision toggles, and database connection',
        };
      default:
        return {
          title: 'Terminal Desk',
          description: 'Campus Zero-Credit Logistics Terminal',
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="h-16 px-6 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Route Context Breadcrumb */}
      <div>
        <h1 className="text-sm font-bold tracking-tight text-foreground">{meta.title}</h1>
        <p className="text-[11px] text-muted-foreground font-mono">{meta.description}</p>
      </div>

      {/* Right Controls: Station Clock & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Manila Station Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-mono text-muted-foreground">
          <Clock className="w-3 h-3 text-primary" />
          <span>{time || '18:00:00 PHT'}</span>
        </div>

        {/* AI Quick Toggles */}
        <div className="hidden md:flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border text-[10px]">
          <button
            type="button"
            onClick={toggleUserReceiptAi}
            aria-label={`Toggle Student Receipt OCR AI (currently ${config.ai_user_receipt_ocr ? 'enabled' : 'disabled'})`}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring ${
              config.ai_user_receipt_ocr ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>OCR</span>
          </button>
          <button
            type="button"
            onClick={toggleStaffIntakeAi}
            aria-label={`Toggle Staff Intake Precheck AI (currently ${config.ai_staff_intake_precheck ? 'enabled' : 'disabled'})`}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring ${
              config.ai_staff_intake_precheck ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Staff AI</span>
          </button>
        </div>

        {/* Sim Ping Pills */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={simulateClaimPing}
            aria-label="Simulate Student Claim Ping Arrival"
            className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block mr-1.5" />
            <span>Sim Claim</span>
          </button>

          <button
            type="button"
            onClick={simulatePaymentPing}
            aria-label="Simulate Student Payment Ping Arrival"
            className="hidden lg:inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:border-primary/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block mr-1.5" />
            <span>Sim Cash</span>
          </button>
        </div>
      </div>
    </header>
  );
};
