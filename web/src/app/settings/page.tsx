'use client';

import React from 'react';
import { useTerminal } from '@/context/TerminalContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { QrCode, Database, Cpu, Sparkles, ShieldCheck, Printer } from 'lucide-react';

export default function SettingsPage() {
  const {
    config,
    staffSession,
    toggleUserReceiptAi,
    toggleStaffIntakeAi,
    setIsStationQrModalOpen,
    setIsDatabaseModalOpen,
    setIsAuthModalOpen,
  } = useTerminal();

  const isLive = isSupabaseConfigured();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-border pb-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
          Desk Function 05
        </span>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          System & Station Hub
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Terminal station identity, AI engine toggles, and persistence configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Station Identity & QR Poster Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Station Identity
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
              Active Node
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-xl font-black tracking-tight text-foreground">
              CTU Danao Main Campus
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Station Code: CTU-DANAO-MAIN-HUB
            </p>
            <p className="text-xs text-muted-foreground">
              Physical counter location for student arrivals and courier parcel deliveries.
            </p>
          </div>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsStationQrModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Open Poster Modal</span>
            </button>
            <button
              type="button"
              onClick={() => setIsStationQrModalOpen(true)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring border border-border"
              aria-label="Direct Print Poster"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. AI Vision Telemetry Engine Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Gemini AI Engines
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-success/15 text-success border border-success/30">
              Operational
            </span>
          </div>

          <div className="space-y-3">
            {/* Toggle 1: User Receipt OCR */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Student Receipt OCR</div>
                  <div className="text-[11px] text-muted-foreground">Autofills pre-registration tracking & COD</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleUserReceiptAi}
                aria-label={`Toggle Student Receipt OCR (currently ${config.ai_user_receipt_ocr ? 'enabled' : 'disabled'})`}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  config.ai_user_receipt_ocr
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {config.ai_user_receipt_ocr ? 'Enabled' : 'Bypassed'}
              </button>
            </div>

            {/* Toggle 2: Staff Intake Precheck */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Staff Intake Precheck</div>
                  <div className="text-[11px] text-muted-foreground">Laser scanline & barcode inspection</div>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleStaffIntakeAi}
                aria-label={`Toggle Staff Intake Precheck (currently ${config.ai_staff_intake_precheck ? 'enabled' : 'disabled'})`}
                className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  config.ai_staff_intake_precheck
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {config.ai_staff_intake_precheck ? 'Enabled' : 'Bypassed'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Persistence & Database Sync Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Persistence Layer
            </span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                isLive
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-warning/15 text-warning border border-warning/30'
              }`}
            >
              {isLive ? 'Supabase Live' : 'Local Sandbox'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-bold text-foreground">
              {isLive ? 'PostgreSQL & Realtime Sync Active' : 'In-Memory Mock Persistence'}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isLive
                ? 'All consignments, escrow ledgers, and visual logs are synchronized in real-time across student and staff terminals.'
                : 'Running with mock local storage. To connect live Supabase, configure your .env.local credentials and run web/schema.sql.'}
            </p>
          </div>

          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsDatabaseModalOpen(true)}
              className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-surface border border-border text-foreground hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Database className="w-3.5 h-3.5 text-primary" />
              <span>Inspect Database Schema & Tables</span>
            </button>
          </div>
        </div>

        {/* 4. Operator Session & RBAC Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Operator Authorization
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
              RBAC Invariant 1
            </span>
          </div>

          {staffSession ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Staff Operator ID:</span>
                <span className="font-mono font-bold text-foreground">{staffSession.staffId}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Full Name:</span>
                <span className="font-bold text-foreground">{staffSession.fullName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Role Permission:</span>
                <span className="font-mono font-bold text-primary">{staffSession.role}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Work Email:</span>
                <span className="font-mono text-foreground">{staffSession.email}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              No staff session currently authenticated. Counter terminal is locked.
            </div>
          )}

          <div className="pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{staffSession ? 'Switch Staff Account' : 'Authenticate Operator'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
