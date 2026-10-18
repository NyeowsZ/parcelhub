'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatCards } from '@/components/StatCards';
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
import { UserCheck, Camera, Banknote, History, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [visualLogs, setVisualLogs] = useState<VisualLogRow[]>([]);
  const [, setLedger] = useState<EscrowLedgerRow[]>([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);

  // Theme State (Dark by default, persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Theme Management
  useEffect(() => {
    const savedTheme = localStorage.getItem('parcelhub_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
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
    } catch (e) {
      console.warn('Data fetch error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = DataService.subscribeToChanges(() => {
      loadData();
      showToast('Live Realtime Update received from Supabase!');
    });
    return () => unsubscribe();
  }, [loadData]);

  // Toggle independent AI settings
  const handleToggleUserReceiptAi = async () => {
    const newVal = !config.ai_user_receipt_ocr;
    await DataService.updateConfigToggle('ai_user_receipt_ocr', newVal);
    setConfig((c) => ({ ...c, ai_user_receipt_ocr: newVal }));
    showToast(`Student Receipt AI OCR is now ${newVal ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleToggleStaffIntakeAi = async () => {
    const newVal = !config.ai_staff_intake_precheck;
    await DataService.updateConfigToggle('ai_staff_intake_precheck', newVal);
    setConfig((c) => ({ ...c, ai_staff_intake_precheck: newVal }));
    showToast(`Staff Intake AI Precheck is now ${newVal ? 'ENABLED' : 'DISABLED'}`);
  };

  // 1. Handle Cash-In Transition: STAGED -> FUNDED
  const handleCommitCashIn = async (
    parcelId: string,
    cashDeposited: number,
    staffId: string
  ) => {
    await DataService.commitCashIn(parcelId, cashDeposited, staffId);
    await loadData();
    showToast('Physical envelope funded successfully! State advanced to FUNDED.');
  };

  // 2. Handle Courier Intake Transition: FUNDED -> RECEIVED_LOGGED
  const handleCommitIntake = async (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string,
    exactDisbursed: number,
    staffId: string
  ) => {
    await DataService.commitIntake(
      parcelId,
      extractedWaybill,
      condition,
      confidence,
      imageUri,
      !config.ai_staff_intake_precheck,
      exactDisbursed,
      staffId
    );
    await loadData();
    showToast('Intake logged & envelope disbursed! Notification dispatched to student.');
    setActiveTab('QUEUE');
  };

  // 3. Handle Inverted Claim Handshake: RECEIVED_LOGGED -> CLAIMED
  const handleExecuteClaim = async (parcelIds: string | string[], staffId: string) => {
    const ids = Array.isArray(parcelIds) ? parcelIds : [parcelIds];
    await DataService.executeClaim(ids, staffId);
    await loadData();

    showToast(
      `Atomic handover complete! Released ${ids.length} package(s) with cash change to recipient.`
    );
  };

  // 4. Simulate Student Scanning Station QR to Pay Cash (Unlocks Cash-In Tab)
  const handleSimulatePaymentPing = async () => {
    const unpinged = parcels.find((p) => p.current_status === 'STAGED' && !p.payment_pinged_at);
    if (unpinged) {
      await DataService.commitPaymentPing(unpinged.parcel_id);
      await loadData();
      showToast(`Payment Ping: Student scanned station QR for ${unpinged.waybill_number}! Unlocked in Cash-In.`);
      setActiveTab('CASH_IN');
    } else {
      showToast('All staged parcels already have payment pings active.');
      setActiveTab('CASH_IN');
    }
  };

  // 5. Simulate Student Dispatching Claim Ping
  const handleSimulateClaimPing = async () => {
    const candidate = parcels.find(
      (p) => p.current_status === 'RECEIVED_LOGGED' && !p.claim_pinged_at
    );

    if (candidate) {
      await DataService.dispatchClaimPing(candidate.parcel_id);
      await loadData();
      showToast(
        `Claim Ping: ${candidate.recipient_name} entered MPIN & pinged desk! Surfaced in queue.`
      );
      setActiveTab('QUEUE');
    } else {
      showToast('No unpinged parcels currently awaiting pickup in hub custody.');
      setActiveTab('QUEUE');
    }
  };

  const activePingCount = parcels.filter(
    (p) => p.current_status === 'RECEIVED_LOGGED' && p.claim_pinged_at
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Floating Frosted Header */}
      <Navbar
        userReceiptAi={config.ai_user_receipt_ocr}
        staffIntakeAi={config.ai_staff_intake_precheck}
        onToggleUserReceiptAi={handleToggleUserReceiptAi}
        onToggleStaffIntakeAi={handleToggleStaffIntakeAi}
        onOpenStationQrModal={() => setIsStationQrModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onSimulateClaimPing={handleSimulateClaimPing}
        onSimulatePaymentPing={handleSimulatePaymentPing}
        activePingCount={activePingCount}
        staffSession={staffSession}
        onLogoutStaff={handleLogoutStaff}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="card-lift glass-card mb-5 p-3.5 rounded-2xl bg-surface/95 text-foreground font-medium text-xs flex items-center justify-between border border-primary/30 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              aria-label="Dismiss notification"
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ✕
            </button>
          </div>
        )}

        {/* 4 Telemetry Counters */}
        <StatCards
          parcels={parcels}
          onNavigateToQueue={() => setActiveTab('QUEUE')}
        />

        {/* Segmented Mode Switcher (Pill Switcher) */}
        <nav aria-label="Terminal Workflow Modes" className="flex items-center gap-1.5 border-b border-border pb-3 mb-5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            aria-label="Switch to Claim Handshake Queue tab"
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === 'QUEUE'
                ? 'bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(255,45,32,0.35)]'
                : 'bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. Claim Handshake Queue</span>
            {activePingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-success text-success-foreground font-black text-[9px] flex items-center justify-center animate-pulse">
                {activePingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INTAKE')}
            aria-label="Switch to Courier Arrival & AI Ingestion tab"
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === 'INTAKE'
                ? 'bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(255,45,32,0.35)]'
                : 'bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>2. Courier Arrival & AI Ingestion</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CASH_IN')}
            aria-label="Switch to Cash-In & Envelopes tab"
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === 'CASH_IN'
                ? 'bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(255,45,32,0.35)]'
                : 'bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>3. Cash-In & Envelopes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            aria-label="Switch to Envelope Vault Ledger tab"
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === 'LEDGER'
                ? 'bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(255,45,32,0.35)]'
                : 'bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated border border-border'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>4. Envelope Vault Ledger</span>
          </button>
        </nav>

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
      </main>

      {/* 1. Dedicated Claim Handshake Modal */}
      <ClaimHandshakeModal
        parcel={selectedClaimParcel}
        visualLog={visualLogs.find((v) => v.parcel_id === selectedClaimParcel?.parcel_id)}
        isOpen={Boolean(selectedClaimParcel)}
        onClose={() => setSelectedClaimParcel(null)}
        onExecuteClaim={handleExecuteClaim}
        staffSession={staffSession}
      />

      {/* 2. Dedicated Courier Intake Modal */}
      <CourierIntakeModal
        parcel={selectedIntakeParcel}
        isOpen={Boolean(selectedIntakeParcel)}
        onClose={() => setSelectedIntakeParcel(null)}
        staffIntakeAi={config.ai_staff_intake_precheck}
        staffSession={staffSession}
        onCommitIntake={handleCommitIntake}
      />

      {/* 3. Dedicated Cash-In Funding Modal */}
      <CashInModal
        parcel={selectedCashInParcel}
        isOpen={Boolean(selectedCashInParcel)}
        onClose={() => setSelectedCashInParcel(null)}
        staffSession={staffSession}
        onCommitCashIn={handleCommitCashIn}
        onPrintEnvelope={(p) => setSlipModalParcel(p)}
      />

      {/* 4. Dedicated PoLP Parcel Detail Inspector Modal */}
      <ParcelDetailModal
        parcel={selectedDetailParcel}
        visualLog={visualLogs.find((v) => v.parcel_id === selectedDetailParcel?.parcel_id)}
        isOpen={Boolean(selectedDetailParcel)}
        onClose={() => setSelectedDetailParcel(null)}
      />

      {/* 5. Staff Authentication Modal (Opens when logged out) */}
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
