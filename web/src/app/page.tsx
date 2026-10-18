'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroStage } from '@/components/HeroStage';
import { TrustBar } from '@/components/TrustBar';
import { StatCards } from '@/components/StatCards';
import { OfferingCards } from '@/components/OfferingCards';
import { TestimonialStack } from '@/components/TestimonialStack';
import { QueueTab } from '@/components/tabs/QueueTab';
import { IntakeTab } from '@/components/tabs/IntakeTab';
import { CashInTab } from '@/components/tabs/CashInTab';
import { LedgerTab } from '@/components/tabs/LedgerTab';
import { ClaimHandshakeModal } from '@/components/modals/ClaimHandshakeModal';
import { CourierIntakeModal } from '@/components/modals/CourierIntakeModal';
import { CashInModal } from '@/components/modals/CashInModal';
import { ParcelDetailModal } from '@/components/modals/ParcelDetailModal';
import { PrintStationQrModal } from '@/components/modals/PrintStationQrModal';
import { EnvelopeSlipModal } from '@/components/modals/EnvelopeSlipModal';
import { DatabaseModal } from '@/components/DatabaseModal';
import { StaffAuthModal, StaffSession } from '@/components/StaffAuthModal';
import { DataService } from '@/lib/dataService';
import { INITIAL_CONFIG } from '@/lib/store';
import { ParcelRow, VisualLogRow, EscrowLedgerRow } from '@/types/database';

export default function Home() {
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [visualLogs, setVisualLogs] = useState<VisualLogRow[]>([]);
  const [, setLedger] = useState<EscrowLedgerRow[]>([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);

  // Theme State: Default to Warm Chalk (#faf9f7) as per Symph Studio Craft 60% dominant canvas
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Authentication: Staff session gating desk operations
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Tab Workspace
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER'>('QUEUE');

  // Modal State Management
  const [selectedClaimParcel, setSelectedClaimParcel] = useState<ParcelRow | null>(null);
  const [selectedIntakeParcel, setSelectedIntakeParcel] = useState<ParcelRow | null>(null);
  const [selectedCashInParcel, setSelectedCashInParcel] = useState<ParcelRow | null>(null);
  const [selectedDetailParcel, setSelectedDetailParcel] = useState<ParcelRow | null>(null);
  const [slipModalParcel, setSlipModalParcel] = useState<ParcelRow | null>(null);
  const [isStationQrModalOpen, setIsStationQrModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem('parcelhub_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : false;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('parcelhub_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Check stored staff session on mount
  useEffect(() => {
    const saved = localStorage.getItem('parcelhub_staff_session');
    if (saved) {
      try {
        setStaffSession(JSON.parse(saved));
      } catch {
        setIsAuthModalOpen(true);
      }
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleLoginSuccess = (session: StaffSession) => {
    setStaffSession(session);
    localStorage.setItem('parcelhub_staff_session', JSON.stringify(session));
    setIsAuthModalOpen(false);
    showToast(`Staff authorized: ${session.staffId} (${session.fullName})`);
  };

  const handleLogoutStaff = () => {
    localStorage.removeItem('parcelhub_staff_session');
    setStaffSession(null);
    setIsAuthModalOpen(true);
    showToast('Staff logged out. Terminal locked.');
  };

  // Load parcels from Supabase or persistent DataService
  const loadData = useCallback(async () => {
    try {
      const [p, v, l, cfg] = await Promise.all([
        DataService.getParcels(),
        DataService.getVisualLogs(),
        DataService.getLedger(),
        DataService.getSystemConfig(),
      ]);
      setParcels(p);
      setVisualLogs(v);
      setLedger(l);
      setConfig((prev) => ({
        ...prev,
        ai_user_receipt_ocr: cfg.ai_user_receipt_ocr,
        ai_staff_intake_precheck: cfg.ai_staff_intake_precheck,
      }));
    } catch (err) {
      console.error('Failed to load terminal data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Operational Handlers
  const handleExecuteClaim = async (parcelIds: string | string[], staffId: string) => {
    try {
      await DataService.executeClaim(parcelIds, staffId);
      await loadData();
      const count = Array.isArray(parcelIds) ? parcelIds.length : 1;
      showToast(
        count > 1
          ? `Batch released ${count} parcels to waiting recipients.`
          : 'Consignment successfully handed over to verified recipient.'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Claim failed: ${message}`);
    }
  };

  const handleCommitIntake = async (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string,
    exactDisbursed: number,
    staffId: string
  ) => {
    try {
      await DataService.commitIntake(
        parcelId,
        extractedWaybill,
        condition,
        confidence,
        imageUri,
        false,
        exactDisbursed,
        staffId
      );
      await loadData();
      showToast(`Consignment verified and locked in custody. Payout of ₱${exactDisbursed.toFixed(2)} recorded.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Intake error: ${message}`);
    }
  };

  const handleCommitCashIn = async (parcelId: string, cashDeposited: number, staffId: string) => {
    try {
      await DataService.commitCashIn(parcelId, cashDeposited, staffId);
      await loadData();
      showToast(`Deposit of ₱${cashDeposited.toFixed(2)} received and sealed into vault envelope.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Cash-in error: ${message}`);
    }
  };

  // Simulation Triggers
  const handleSimulateClaimPing = async () => {
    const candidate = parcels.find((p) => p.current_status === 'RECEIVED_LOGGED' && !p.claim_pinged_at);
    if (!candidate) {
      showToast('No unpinged parcels in hub custody to simulate.');
      return;
    }
    await DataService.dispatchClaimPing(candidate.parcel_id);
    await loadData();
    showToast(`Simulation: Student arrived for waybill ${candidate.waybill_number}. Ping active!`);
  };

  const handleSimulatePaymentPing = async () => {
    const candidate = parcels.find((p) => p.current_status === 'STAGED' && !p.payment_pinged_at);
    if (!candidate) {
      showToast('No unpinged staged parcels to simulate.');
      return;
    }
    await DataService.commitPaymentPing(candidate.parcel_id);
    await loadData();
    showToast(`Simulation: Student pinged counter for deposit on ${candidate.waybill_number}.`);
  };

  const handleToggleUserReceiptAi = async () => {
    const nextVal = !config.ai_user_receipt_ocr;
    setConfig((c) => ({ ...c, ai_user_receipt_ocr: nextVal }));
    await DataService.updateConfigToggle('ai_user_receipt_ocr', nextVal);
    showToast(`Student Receipt OCR AI ${nextVal ? 'Activated' : 'Bypassed'}`);
  };

  const handleToggleStaffIntakeAi = async () => {
    const nextVal = !config.ai_staff_intake_precheck;
    setConfig((c) => ({ ...c, ai_staff_intake_precheck: nextVal }));
    await DataService.updateConfigToggle('ai_staff_intake_precheck', nextVal);
    showToast(`Staff Intake Precheck AI ${nextVal ? 'Activated' : 'Bypassed'}`);
  };

  const scrollToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Counts for tabs and capability cards
  const activePingCount = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED' && p.claim_pinged_at
  ).length;
  const queueCount = parcels.filter((p) => p.current_status === 'RECEIVED_LOGGED').length;
  const intakeCount = parcels.filter((p) => p.current_status === 'FUNDED').length;
  const cashInCount = parcels.filter((p) => p.current_status === 'STAGED').length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary selection:text-primary-foreground">
      {/* 1. Symph Studio Header (1:1 from references/navbar.md) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          scrollToWorkspace();
        }}
        queueCount={queueCount}
        intakeCount={intakeCount}
        cashInCount={cashInCount}
        userReceiptAi={config.ai_user_receipt_ocr}
        staffIntakeAi={config.ai_staff_intake_precheck}
        onToggleUserReceiptAi={handleToggleUserReceiptAi}
        onToggleStaffIntakeAi={handleToggleStaffIntakeAi}
        onOpenStationQrModal={() => setIsStationQrModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onSimulateClaimPing={handleSimulateClaimPing}
        onSimulatePaymentPing={handleSimulatePaymentPing}
        staffSession={staffSession}
        onLogoutStaff={handleLogoutStaff}
        onOpenStaffAuth={() => setIsAuthModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Symph Cinematic Studio Hero Stage (1:1 from references/layouts-tables.md Section 1) */}
      <HeroStage
        waitingCount={activePingCount}
        onOpenClaimModal={() => {
          const pinged = parcels.find((p) => p.current_status === 'RECEIVED_LOGGED' && p.claim_pinged_at);
          if (pinged) setSelectedClaimParcel(pinged);
          else {
            setActiveTab('QUEUE');
            scrollToWorkspace();
          }
        }}
        onOpenIntakeModal={() => {
          const funded = parcels.find((p) => p.current_status === 'FUNDED');
          if (funded) setSelectedIntakeParcel(funded);
          else {
            setActiveTab('INTAKE');
            scrollToWorkspace();
          }
        }}
        onScrollToWorkspace={scrollToWorkspace}
      />

      {/* 3. Partner / Infrastructure Trust Bar (1:1 from references/layouts-tables.md Section 2) */}
      <TrustBar />

      {/* Main Terminal Workspace */}
      <main ref={workspaceRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* 4. High-Density KPI Metric Cards (1:1 from references/cards.md Section 3) */}
        <StatCards
          parcels={parcels}
          onNavigateToQueue={() => setActiveTab('QUEUE')}
        />

        {/* 5. Symph Offering / Capability Launchpad Cards (1:1 from references/cards.md Section 1) */}
        <OfferingCards
          onSelectModule={(mode) => setActiveTab(mode)}
          queueCount={queueCount}
          intakeCount={intakeCount}
          cashInCount={cashInCount}
          ledgerCount={parcels.length}
        />

        {/* 6. Filter Pill Toggle Group for Workspaces (1:1 from references/buttons-inputs.md lines 135-155) */}
        <div className="space-y-6 pt-4 border-t border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                Active Desk Session
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Operational Workspace
              </h2>
            </div>

            {/* Filter Pill Toggle Group */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Terminal Modules">
              <button
                type="button"
                onClick={() => setActiveTab('QUEUE')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === 'QUEUE'
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle'
                }`}
              >
                1. Queue ({queueCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('INTAKE')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === 'INTAKE'
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle'
                }`}
              >
                2. Intake ({intakeCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CASH_IN')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === 'CASH_IN'
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle'
                }`}
              >
                3. Cash-In ({cashInCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LEDGER')}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === 'LEDGER'
                    ? 'bg-foreground text-background'
                    : 'bg-transparent text-muted-foreground border border-border hover:text-foreground hover:border-border-subtle'
                }`}
              >
                4. Ledger ({parcels.length})
              </button>
            </div>
          </div>

          {/* Active Tab Screen */}
          {activeTab === 'QUEUE' && (
            <QueueTab
              parcels={parcels}
              visualLogs={visualLogs}
              onOpenClaimModal={(p) => setSelectedClaimParcel(p)}
              onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
              onBatchExecuteClaim={(ids) => handleExecuteClaim(ids, staffSession?.staffId || 'STAFF-0488')}
            />
          )}

          {activeTab === 'INTAKE' && (
            <IntakeTab
              parcels={parcels}
              onOpenIntakeModal={(p) => setSelectedIntakeParcel(p)}
              onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
            />
          )}

          {activeTab === 'CASH_IN' && (
            <CashInTab
              parcels={parcels}
              onOpenCashInModal={(p) => setSelectedCashInParcel(p)}
              onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
            />
          )}

          {activeTab === 'LEDGER' && (
            <LedgerTab
              parcels={parcels}
              onOpenDetailModal={(p) => setSelectedDetailParcel(p)}
            />
          )}
        </div>

        {/* 7. Symph Editorial Testimonial Stack (1:1 from references/feedback-dialogs.md lines 1-38) */}
        <TestimonialStack />
      </main>

      {/* 8. Frosted Notice / Toast Banner (1:1 from references/feedback-dialogs.md Section 3) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-6 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border shadow-xl space-y-4 max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Terminal Notification</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {toastMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 9. Dedicated Interactive Modals (All 1:1 from references/feedback-dialogs.md Section 2) */}
      {/* 1. Claim Handshake Modal */}
      <ClaimHandshakeModal
        parcel={selectedClaimParcel}
        visualLog={visualLogs.find((v) => v.parcel_id === selectedClaimParcel?.parcel_id)}
        isOpen={Boolean(selectedClaimParcel)}
        onClose={() => setSelectedClaimParcel(null)}
        onExecuteClaim={handleExecuteClaim}
        staffSession={staffSession}
      />

      {/* 2. Courier Intake Modal */}
      <CourierIntakeModal
        parcel={selectedIntakeParcel}
        isOpen={Boolean(selectedIntakeParcel)}
        onClose={() => setSelectedIntakeParcel(null)}
        staffIntakeAi={config.ai_staff_intake_precheck}
        staffSession={staffSession}
        onCommitIntake={handleCommitIntake}
      />

      {/* 3. Cash-In Funding Modal */}
      <CashInModal
        parcel={selectedCashInParcel}
        isOpen={Boolean(selectedCashInParcel)}
        onClose={() => setSelectedCashInParcel(null)}
        staffSession={staffSession}
        onCommitCashIn={handleCommitCashIn}
        onPrintEnvelope={(p) => setSlipModalParcel(p)}
      />

      {/* 4. PoLP Parcel Detail Inspector Modal */}
      <ParcelDetailModal
        parcel={selectedDetailParcel}
        visualLog={visualLogs.find((v) => v.parcel_id === selectedDetailParcel?.parcel_id)}
        isOpen={Boolean(selectedDetailParcel)}
        onClose={() => setSelectedDetailParcel(null)}
      />

      {/* 5. Staff Authentication Modal */}
      <StaffAuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 6. Printable Stationary QR Poster Modal */}
      <PrintStationQrModal
        isOpen={isStationQrModalOpen}
        onClose={() => setIsStationQrModalOpen(false)}
        stationCode={config.station_code}
        stationName={config.station_name}
      />

      {/* 7. Printable Envelope Slip Modal */}
      <EnvelopeSlipModal
        parcel={slipModalParcel}
        onClose={() => setSlipModalParcel(null)}
      />

      {/* 8. Database Connection Info Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
}
