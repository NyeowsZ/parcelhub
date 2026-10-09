'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatCards } from '@/components/StatCards';
import { QueueTab } from '@/components/tabs/QueueTab';
import { IntakeTab } from '@/components/tabs/IntakeTab';
import { CashInTab } from '@/components/tabs/CashInTab';
import { LedgerTab } from '@/components/tabs/LedgerTab';
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
  const [ledger, setLedger] = useState<EscrowLedgerRow[]>([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);

  // Authentication: Staff session gating desk operations
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER'>('QUEUE');
  const [isStationQrModalOpen, setIsStationQrModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [slipModalParcel, setSlipModalParcel] = useState<ParcelRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
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
      showToast('⚡ Live Realtime Update received from Supabase!');
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
      showToast(`⚡ Payment Ping: Student scanned station QR for ${unpinged.waybill_number}! Unlocked in Cash-In tab.`);
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
        `🚨 Claim Ping: ${candidate.recipient_name} entered MPIN & pinged CTU Danao desk! Surfaced at top of queue.`
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
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
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-600 text-white font-medium text-xs flex items-center justify-between shadow-xl shadow-blue-600/20 border border-blue-500 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white font-bold text-xs"
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

        {/* Primary Operational Tabs (Rounded Pill Switcher) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Claim Handshake Queue</span>
            {activePingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                {activePingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('INTAKE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'INTAKE'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>2. Courier Arrival & AI Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('CASH_IN')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'CASH_IN'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>3. Cash-In & Envelopes</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>4. Envelope Vault Ledger</span>
          </button>
        </div>

        {/* Active Tab Screen */}
        {activeTab === 'QUEUE' && (
          <QueueTab
            parcels={parcels}
            visualLogs={visualLogs}
            staffSession={staffSession}
            onExecuteClaim={handleExecuteClaim}
          />
        )}

        {activeTab === 'INTAKE' && (
          <IntakeTab
            parcels={parcels}
            staffIntakeAi={config.ai_staff_intake_precheck}
            staffSession={staffSession}
            onCommitIntake={handleCommitIntake}
          />
        )}

        {activeTab === 'CASH_IN' && (
          <CashInTab
            parcels={parcels}
            staffSession={staffSession}
            onCommitCashIn={handleCommitCashIn}
            onPrintEnvelope={(p) => setSlipModalParcel(p)}
          />
        )}

        {activeTab === 'LEDGER' && (
          <LedgerTab parcels={parcels} ledger={ledger} />
        )}
      </main>

      {/* Staff Authentication Modal (Opens when logged out) */}
      <StaffAuthModal
        isOpen={isAuthModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Printable Stationary QR Poster Modal */}
      <PrintStationQrModal
        isOpen={isStationQrModalOpen}
        onClose={() => setIsStationQrModalOpen(false)}
        stationCode={config.station_code}
        stationName={config.station_name}
      />

      {/* Printable Envelope Slip Modal */}
      <EnvelopeSlipModal
        parcel={slipModalParcel}
        onClose={() => setSlipModalParcel(null)}
      />

      {/* Database Connection Info Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
}
