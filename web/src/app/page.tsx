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
import { DataService } from '@/lib/dataService';
import { INITIAL_CONFIG } from '@/lib/store';
import { ParcelRow, VisualLogRow, EscrowLedgerRow } from '@/types/database';
import { UserCheck, Camera, Banknote, History, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [visualLogs, setVisualLogs] = useState<VisualLogRow[]>([]);
  const [ledger, setLedger] = useState<EscrowLedgerRow[]>([]);
  const [config, setConfig] = useState(INITIAL_CONFIG);

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER'>('QUEUE');
  const [isStationQrModalOpen, setIsStationQrModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [slipModalParcel, setSlipModalParcel] = useState<ParcelRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Load parcels from Supabase or persistent DataService
  const loadData = useCallback(async () => {
    try {
      const [p, v, l] = await Promise.all([
        DataService.getParcels(),
        DataService.getVisualLogs(),
        DataService.getLedger(),
      ]);
      setParcels(p);
      setVisualLogs(v);
      setLedger(l);
    } catch (e) {
      console.warn('Data fetch error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Subscribe to live Supabase Realtime channel
    const unsubscribe = DataService.subscribeToChanges(() => {
      loadData();
      showToast('⚡ Live Realtime Update received from Supabase!');
    });
    return () => unsubscribe();
  }, [loadData]);

  // 1. Handle Cash-In Transition: STAGED -> FUNDED
  const handleCommitCashIn = async (parcelId: string, cashDeposited: number) => {
    await DataService.commitCashIn(parcelId, cashDeposited);
    await loadData();
    showToast('Physical envelope funded successfully! State advanced to FUNDED.');
  };

  // 2. Handle Courier Intake Transition: FUNDED -> RECEIVED_LOGGED
  const handleCommitIntake = async (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string
  ) => {
    await DataService.commitIntake(
      parcelId,
      extractedWaybill,
      condition,
      confidence,
      imageUri,
      !config.ai_required
    );
    await loadData();
    showToast('Intake logged & verified with Gemini AI! Notification dispatched to recipient.');
    setActiveTab('QUEUE');
  };

  // 3. Handle Inverted Claim Handshake: RECEIVED_LOGGED -> CLAIMED
  const handleExecuteClaim = async (parcelId: string) => {
    const target = parcels.find((p) => p.parcel_id === parcelId);
    await DataService.executeClaim(parcelId);
    await loadData();

    showToast(
      `Atomic handover complete! ₱${Math.max(0, target?.change_due || 0).toFixed(2)} change disbursed to ${
        target?.recipient_name || 'student'
      }.`
    );
  };

  // 4. Simulate a student scanning the station QR and entering MPIN
  const handleSimulateClaimPing = () => {
    const candidate = parcels.find(
      (p) => p.current_status === 'RECEIVED_LOGGED' && !p.claim_pinged_at
    );

    if (candidate) {
      setParcels((prev) =>
        prev.map((p) =>
          p.parcel_id === candidate.parcel_id
            ? { ...p, claim_pinged_at: new Date().toISOString() }
            : p
        )
      );
      showToast(
        `🚨 Claim Ping: ${candidate.recipient_name} scanned CTU Danao Hub QR! Populated at top of queue.`
      );
      setActiveTab('QUEUE');
    } else {
      setParcels((prev) =>
        prev.map((p) =>
          p.parcel_id === 'p-101'
            ? { ...p, claim_pinged_at: new Date().toISOString() }
            : p
        )
      );
      showToast('Simulated claim ping dispatched for SPXPH0492817263.');
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
        aiRequired={config.ai_required}
        onToggleAi={() => setConfig((c) => ({ ...c, ai_required: !c.ai_required }))}
        onOpenStationQrModal={() => setIsStationQrModalOpen(true)}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onSimulateClaimPing={handleSimulateClaimPing}
        activePingCount={activePingCount}
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

        {/* 4 Telemetry Counters (including Hero Metric Card) */}
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
            onExecuteClaim={handleExecuteClaim}
          />
        )}

        {activeTab === 'INTAKE' && (
          <IntakeTab
            parcels={parcels}
            aiRequired={config.ai_required}
            onCommitIntake={handleCommitIntake}
          />
        )}

        {activeTab === 'CASH_IN' && (
          <CashInTab
            parcels={parcels}
            onCommitCashIn={handleCommitCashIn}
            onPrintEnvelope={(p) => setSlipModalParcel(p)}
          />
        )}

        {activeTab === 'LEDGER' && (
          <LedgerTab parcels={parcels} ledger={ledger} />
        )}
      </main>

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
