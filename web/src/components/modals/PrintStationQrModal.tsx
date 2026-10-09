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
          width: 280,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200">
        {/* Close Button (No print) */}
        <button
          onClick={onClose}
          className="no-print absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Poster Area */}
        <div className="text-center space-y-4 pt-2">
          {/* Header */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700">
              Campus Logistics Terminal
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              ParcelHub Claim Station
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {stationName}
            </p>
          </div>

          {/* QR Code Canvas */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-300 inline-block">
            <canvas ref={canvasRef} className="rounded-xl mx-auto" />
            <p className="text-xs font-mono font-bold text-slate-700 mt-2">
              {stationCode}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-left text-xs space-y-1.5">
            <p className="font-bold text-blue-900">Pickup Instructions for Students:</p>
            <ol className="list-decimal pl-4 text-blue-800 space-y-1 text-[11px]">
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
            onClick={handlePrint}
            className="flex-1 py-3 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Counter Poster</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
