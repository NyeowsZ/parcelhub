'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatCards } from '@/components/StatCards';
import { QueueTab } from '@/components/tabs/QueueTab';
import { IntakeTab } from '@/components/tabs/IntakeTab';
import { CashInTab } from '@/components/tabs/CashInTab';
import { LedgerTab } from '@/components/tabs/LedgerTab';
import { PrintStationQrModal } from '@/components/modals/PrintStationQrModal';
import { EnvelopeSlipModal } from '@/components/modals/EnvelopeSlipModal';
import {
  INITIAL_PARCELS,
  INITIAL_VISUAL_LOGS,
  INITIAL_LEDGER,
  INITIAL_CONFIG,
} from '@/lib/store';
import { ParcelRow, VisualLogRow, EscrowLedgerRow } from '@/types/database';
import { UserCheck, Camera, Banknote, History, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [parcels, setParcels] = useState<ParcelRow[]>(INITIAL_PARCELS);
  const [visualLogs, setVisualLogs] = useState<VisualLogRow[]>(INITIAL_VISUAL_LOGS);
  const [ledger, setLedger] = useState<EscrowLedgerRow[]>(INITIAL_LEDGER);
  const [config, setConfig] = useState(INITIAL_CONFIG);

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'INTAKE' | 'CASH_IN' | 'LEDGER'>('QUEUE');
  const [isStationQrModalOpen, setIsStationQrModalOpen] = useState(false);
  const [slipModalParcel, setSlipModalParcel] = useState<ParcelRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Handle Cash-In Transition: STAGED -> FUNDED
  const handleCommitCashIn = (parcelId: string, cashDeposited: number) => {
    setParcels((prev) =>
      prev.map((p) => {
        if (p.parcel_id === parcelId) {
          const change = cashDeposited - p.cod_amount;
          return {
            ...p,
            cash_deposited: cashDeposited,
            change_due: change,
            current_status: 'FUNDED',
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Record in ledger
    setLedger((prev) => [
      {
        transaction_id: `tx-${Date.now()}`,
        parcel_id: parcelId,
        amount: cashDeposited,
        transaction_type: 'DEPOSIT',
        staff_session_id: 'ST-0488',
        committed_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    showToast('Physical envelope funded successfully! State advanced to FUNDED.');
  };

  // 2. Handle Courier Intake Transition: FUNDED -> RECEIVED_LOGGED
  const handleCommitIntake = (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string
  ) => {
    setParcels((prev) =>
      prev.map((p) => {
        if (p.parcel_id === parcelId) {
          return {
            ...p,
            current_status: 'RECEIVED_LOGGED',
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Save visual log
    setVisualLogs((prev) => [
      {
        log_id: `vl-${Date.now()}`,
        parcel_id: parcelId,
        image_storage_uri: imageUri,
        image_hash_sha256: `sha256-${Date.now()}`,
        detected_waybill: extractedWaybill,
        ai_bypassed: !config.ai_required,
        package_condition: condition,
        confidence_score: confidence,
        verified_by_staff_id: 'ST-0488',
        verified_at: new Date().toISOString(),
      },
      ...prev,
    ]);

    showToast('Intake logged & verified with Gemini AI! Notification dispatched to recipient.');
    setActiveTab('QUEUE');
  };

  // 3. Handle Inverted Claim Handshake: RECEIVED_LOGGED -> CLAIMED
  const handleExecuteClaim = (parcelId: string) => {
    const target = parcels.find((p) => p.parcel_id === parcelId);
    if (!target) return;

    setParcels((prev) =>
      prev.map((p) => {
        if (p.parcel_id === parcelId) {
          return {
            ...p,
            current_status: 'CLAIMED',
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    showToast(
      `Atomic handover complete! ₱${Math.max(0, target.change_due).toFixed(2)} change disbursed to ${
        target.recipient_name || 'student'
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
      // Re-ping p-101
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
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        aiRequired={config.ai_required}
        onToggleAi={() => setConfig((c) => ({ ...c, ai_required: !c.ai_required }))}
        onOpenStationQrModal={() => setIsStationQrModalOpen(true)}
        onSimulateClaimPing={handleSimulateClaimPing}
        activePingCount={activePingCount}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-600/90 text-white font-medium text-xs flex items-center justify-between shadow-xl shadow-blue-600/30 border border-blue-400/40 animate-in fade-in slide-in-from-top-2">
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
        <StatCards parcels={parcels} />

        {/* Primary Operational Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Claim Handshake Queue</span>
            {activePingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                {activePingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('INTAKE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'INTAKE'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>2. Courier Arrival & AI Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('CASH_IN')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'CASH_IN'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>3. Cash-In & Envelopes</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>4. Envelope Vault Ledger</span>
          </button>
        </div>

        {/* Tab Views */}
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
    </div>
  );
}
