'use client';

import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-qr-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-md bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-border">
        {/* Close Button (No print) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close station QR poster dialog"
          className="no-print absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Poster Area */}
        <div className="text-center space-y-4 pt-1">
          {/* Header */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              Campus Logistics Terminal
            </span>
            <h3 id="station-qr-title" className="text-xl font-extrabold text-foreground tracking-tight mt-2">
              ParcelHub Claim Station
            </h3>
            <p className="text-xs font-semibold text-muted-foreground">
              {stationName}
            </p>
          </div>

          {/* QR Code Canvas */}
          <div className="bg-surface-elevated p-4 rounded-2xl border border-border inline-block shadow-sm">
            <canvas ref={canvasRef} className="rounded-xl mx-auto" />
            <p className="text-xs font-mono font-bold text-foreground mt-2">
              {stationCode}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 text-left text-xs space-y-1.5">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">
              Pickup Instructions for Students:
            </p>
            <ol className="list-decimal pl-4 text-muted-foreground space-y-1 text-[11px]">
              <li>Open your ParcelHub Mobile App.</li>
              <li>Tap <strong>Initiate Pickup Handshake</strong>.</li>
              <li>Point your camera at this QR code to authenticate station.</li>
              <li>Enter your 6-digit MPIN to dispatch your claim ping to desk staff.</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons (No print) */}
        <div className="no-print mt-6 flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Print counter QR poster"
            className="relative inline-flex items-center justify-center gap-2 flex-1 py-3 px-5 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary-hover shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <Printer className="relative z-10 w-4 h-4" />
            <span className="relative z-10">Print Poster</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted hover:bg-surface-elevated text-foreground border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
