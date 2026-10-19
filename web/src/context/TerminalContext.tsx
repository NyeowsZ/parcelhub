'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParcelRow, VisualLogRow, EscrowLedgerRow, SystemConfig } from '@/types/database';
import { DataService } from '@/lib/dataService';
import { INITIAL_CONFIG } from '@/lib/store';
import { StaffSession } from '@/components/StaffAuthModal';

interface TerminalContextType {
  parcels: ParcelRow[];
  visualLogs: VisualLogRow[];
  ledger: EscrowLedgerRow[];
  config: SystemConfig;
  staffSession: StaffSession | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  loginStaff: (session: StaffSession) => void;
  logoutStaff: () => void;
  showToast: (msg: string) => void;
  executeClaim: (parcelIds: string | string[], staffId: string) => Promise<void>;
  commitIntake: (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string,
    exactDisbursed: number,
    staffId: string
  ) => Promise<void>;
  commitCashIn: (parcelId: string, cashDeposited: number, staffId: string) => Promise<void>;
  simulateClaimPing: () => Promise<void>;
  simulatePaymentPing: () => Promise<void>;
  toggleUserReceiptAi: () => Promise<void>;
  toggleStaffIntakeAi: () => Promise<void>;
  
  // Modal Openers
  selectedClaimParcel: ParcelRow | null;
  setSelectedClaimParcel: (p: ParcelRow | null) => void;
  selectedIntakeParcel: ParcelRow | null;
  setSelectedIntakeParcel: (p: ParcelRow | null) => void;
  selectedCashInParcel: ParcelRow | null;
  setSelectedCashInParcel: (p: ParcelRow | null) => void;
  selectedDetailParcel: ParcelRow | null;
  setSelectedDetailParcel: (p: ParcelRow | null) => void;
  slipModalParcel: ParcelRow | null;
  setSlipModalParcel: (p: ParcelRow | null) => void;
  isStationQrModalOpen: boolean;
  setIsStationQrModalOpen: (open: boolean) => void;
  isDatabaseModalOpen: boolean;
  setIsDatabaseModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [visualLogs, setVisualLogs] = useState<VisualLogRow[]>([]);
  const [ledger, setLedger] = useState<EscrowLedgerRow[]>([]);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);

  // Theme State: Defaults to Light Canvas (#faf9f7) as per Symph Studio Craft 60% dominant chalk
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Staff Session
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modal Dialogs
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

  const toggleTheme = () => {
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

  const loginStaff = (session: StaffSession) => {
    setStaffSession(session);
    localStorage.setItem('parcelhub_staff_session', JSON.stringify(session));
    setIsAuthModalOpen(false);
    showToast(`Staff authorized: ${session.staffId} (${session.fullName})`);
  };

  const logoutStaff = () => {
    localStorage.removeItem('parcelhub_staff_session');
    setStaffSession(null);
    setIsAuthModalOpen(true);
    showToast('Staff logged out. Terminal locked.');
  };

  // Data Loading
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
  const executeClaim = async (parcelIds: string | string[], staffId: string) => {
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

  const commitIntake = async (
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

  const commitCashIn = async (parcelId: string, cashDeposited: number, staffId: string) => {
    try {
      await DataService.commitCashIn(parcelId, cashDeposited, staffId);
      await loadData();
      showToast(`Deposit of ₱${cashDeposited.toFixed(2)} received and sealed into vault envelope.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Cash-in error: ${message}`);
    }
  };

  const simulateClaimPing = async () => {
    const candidate = parcels.find((p) => p.current_status === 'RECEIVED_LOGGED' && !p.claim_pinged_at);
    if (!candidate) {
      showToast('No unpinged parcels in hub custody to simulate.');
      return;
    }
    await DataService.dispatchClaimPing(candidate.parcel_id);
    await loadData();
    showToast(`Simulation: Student arrived for waybill ${candidate.waybill_number}. Ping active!`);
  };

  const simulatePaymentPing = async () => {
    const candidate = parcels.find((p) => p.current_status === 'STAGED' && !p.payment_pinged_at);
    if (!candidate) {
      showToast('No unpinged staged parcels to simulate.');
      return;
    }
    await DataService.commitPaymentPing(candidate.parcel_id);
    await loadData();
    showToast(`Simulation: Student pinged counter for deposit on ${candidate.waybill_number}.`);
  };

  const toggleUserReceiptAi = async () => {
    const nextVal = !config.ai_user_receipt_ocr;
    setConfig((c) => ({ ...c, ai_user_receipt_ocr: nextVal }));
    await DataService.updateConfigToggle('ai_user_receipt_ocr', nextVal);
    showToast(`Student Receipt OCR AI ${nextVal ? 'Activated' : 'Bypassed'}`);
  };

  const toggleStaffIntakeAi = async () => {
    const nextVal = !config.ai_staff_intake_precheck;
    setConfig((c) => ({ ...c, ai_staff_intake_precheck: nextVal }));
    await DataService.updateConfigToggle('ai_staff_intake_precheck', nextVal);
    showToast(`Staff Intake Precheck AI ${nextVal ? 'Activated' : 'Bypassed'}`);
  };

  return (
    <TerminalContext.Provider
      value={{
        parcels,
        visualLogs,
        ledger,
        config,
        staffSession,
        isDarkMode,
        toggleTheme,
        loginStaff,
        logoutStaff,
        showToast,
        executeClaim,
        commitIntake,
        commitCashIn,
        simulateClaimPing,
        simulatePaymentPing,
        toggleUserReceiptAi,
        toggleStaffIntakeAi,
        selectedClaimParcel,
        setSelectedClaimParcel,
        selectedIntakeParcel,
        setSelectedIntakeParcel,
        selectedCashInParcel,
        setSelectedCashInParcel,
        selectedDetailParcel,
        setSelectedDetailParcel,
        slipModalParcel,
        setSlipModalParcel,
        isStationQrModalOpen,
        setIsStationQrModalOpen,
        isDatabaseModalOpen,
        setIsDatabaseModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
      {/* Edge-anchored notice banner (references/feedback-dialogs.md Section 3) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-6 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border shadow-xl space-y-4 max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Terminal Notification</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{toastMessage}</p>
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
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
