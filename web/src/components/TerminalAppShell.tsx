'use client';

import React from 'react';
import { TerminalProvider, useTerminal } from '@/context/TerminalContext';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { ClaimHandshakeModal } from './modals/ClaimHandshakeModal';
import { CourierIntakeModal } from './modals/CourierIntakeModal';
import { CashInModal } from './modals/CashInModal';
import { ParcelDetailModal } from './modals/ParcelDetailModal';
import { StaffAuthModal } from './StaffAuthModal';
import { PrintStationQrModal } from './modals/PrintStationQrModal';
import { EnvelopeSlipModal } from './modals/EnvelopeSlipModal';
import { DatabaseModal } from './DatabaseModal';

const ModalOrchestrator: React.FC = () => {
  const {
    visualLogs,
    config,
    staffSession,
    loginStaff,
    executeClaim,
    commitIntake,
    commitCashIn,
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
  } = useTerminal();

  return (
    <>
      {/* 1. Claim Handshake Modal */}
      <ClaimHandshakeModal
        parcel={selectedClaimParcel}
        visualLog={visualLogs.find((v) => v.parcel_id === selectedClaimParcel?.parcel_id)}
        isOpen={Boolean(selectedClaimParcel)}
        onClose={() => setSelectedClaimParcel(null)}
        onExecuteClaim={executeClaim}
        staffSession={staffSession}
      />

      {/* 2. Courier Intake Modal */}
      <CourierIntakeModal
        parcel={selectedIntakeParcel}
        isOpen={Boolean(selectedIntakeParcel)}
        onClose={() => setSelectedIntakeParcel(null)}
        staffIntakeAi={config.ai_staff_intake_precheck}
        staffSession={staffSession}
        onCommitIntake={commitIntake}
      />

      {/* 3. Cash-In Funding Modal */}
      <CashInModal
        parcel={selectedCashInParcel}
        isOpen={Boolean(selectedCashInParcel)}
        onClose={() => setSelectedCashInParcel(null)}
        staffSession={staffSession}
        onCommitCashIn={commitCashIn}
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
        onLoginSuccess={loginStaff}
      />

      {/* 6. Printable Stationary QR Poster Modal */}
      <PrintStationQrModal
        isOpen={isStationQrModalOpen}
        onClose={() => setIsStationQrModalOpen(false)}
        stationCode="CTU-DANAO-MAIN-HUB"
        stationName="Main Campus Counter"
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
    </>
  );
};

export const TerminalAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TerminalProvider>
      <div className="min-h-screen flex bg-background text-foreground transition-colors selection:bg-primary selection:text-primary-foreground">
        {/* Left Functional Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>

        {/* Centrally Mounted Modals */}
        <ModalOrchestrator />
      </div>
    </TerminalProvider>
  );
};
