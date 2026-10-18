'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer } from 'lucide-react';

interface PrintStationQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationCode: string;
  stationName: string;
}

export const PrintStationQrModal: React.FC<PrintStationQrModalProps> = ({
  isOpen,
  onClose,
  stationCode,
  stationName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        JSON.stringify({
          type: 'PARCELHUB_STATION',
          station_code: stationCode,
          campus: 'CTU Danao Campus',
        }),
        {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f0f12',
            light: '#ffffff',
          },
        }
      );
    }
  }, [isOpen, stationCode]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="station-qr-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
    >
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-surface border border-border shadow-2xl space-y-6 relative">
        {/* Close Button (1:1 from references/feedback-dialogs.md lines 57-65) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="no-print absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title Stack (1:1 from references/feedback-dialogs.md lines 67-75) */}
        <div className="space-y-1 no-print">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Stationary Poster
          </div>
          <h2 id="modal-title" className="text-2xl font-bold tracking-tight text-foreground">
            Station Check-In QR
          </h2>
          <p className="text-xs text-muted-foreground">
            Mount this code at the desk counter for mobile student arrival check-in.
          </p>
        </div>

        {/* Poster Paper Container */}
        <div className="bg-surface p-6 rounded-2xl border border-border text-center space-y-4 print:border-none print:p-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              CTU Danao · Campus ParcelHub
            </span>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              {stationName || 'Main Hub Terminal'}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Station Code: {stationCode || 'CTU-DANAO-MAIN-HUB'}
            </p>
          </div>

          <div className="flex justify-center p-3 bg-white rounded-xl shadow-xs border border-border inline-block mx-auto">
            <canvas ref={canvasRef} />
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Scan with ParcelHub Mobile App</p>
            <p className="text-[11px]">
              Signals your physical arrival to counter staff for instant parcel claim release.
            </p>
          </div>
        </div>

        {/* Action Button (1:1 from references/feedback-dialogs.md lines 102-107) */}
        <button
          type="button"
          onClick={handlePrint}
          className="no-print w-full py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all shadow-[0_4px_16px_rgba(255,45,32,0.3)] flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Printer className="w-4 h-4" />
          <span>Print Station Poster</span>
        </button>
      </div>
    </div>
  );
};
