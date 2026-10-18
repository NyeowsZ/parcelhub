'use client';

import React, { useState, useRef } from 'react';
import { ParcelRow } from '@/types/database';
import { StaffSession } from '../StaffAuthModal';
import { X, Camera, Upload, CheckCircle, Sparkles, Cpu, Banknote } from 'lucide-react';

interface CourierIntakeModalProps {
  parcel: ParcelRow | null;
  isOpen: boolean;
  onClose: () => void;
  staffIntakeAi: boolean;
  staffSession: StaffSession | null;
  onCommitIntake: (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string,
    exactDisbursed: number,
    staffId: string
  ) => void;
}

export const CourierIntakeModal: React.FC<CourierIntakeModalProps> = ({
  parcel,
  isOpen,
  onClose,
  staffIntakeAi,
  staffSession,
  onCommitIntake,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [exactPaidAmount, setExactPaidAmount] = useState<string>('');
  const [, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (parcel) {
      setExactPaidAmount(parcel.cod_amount.toString());
      setCapturedImage(null);
      setAiResult(null);
      setCameraActive(false);
    }
  }, [parcel]);

  if (!isOpen || !parcel) return null;

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Webcam not accessible. You can upload an image or use sample package.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        setAiResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const useSamplePhoto = () => {
    setCapturedImage('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80');
    setAiResult(null);
  };

  const runAiVerification = async () => {
    if (!capturedImage) return;

    try {
      setVerifying(true);
      const res = await fetch('/api/verify-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          expectedWaybill: parcel.waybill_number,
          parcelId: parcel.parcel_id,
        }),
      });

      const data = await res.json();
      if (data.extraction) {
        setAiResult(data.extraction);
      } else {
        throw new Error(data.error || 'AI verification failed');
      }
    } catch (err: any) {
      alert('Verification error: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const canProceedToPaymentType = !staffIntakeAi || Boolean(aiResult);

  const handleCommit = () => {
    const condition = aiResult?.package_condition || 'INTACT';
    const waybill = aiResult?.waybill_number || parcel.waybill_number;
    const confidence = aiResult?.confidence_score || 0.95;
    const exactDisbursed = parseFloat(exactPaidAmount) || parcel.cod_amount;
    const activeStaffId = staffSession?.staffId || 'STAFF-0488';

    onCommitIntake(
      parcel.parcel_id,
      waybill,
      condition,
      confidence,
      capturedImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
      exactDisbursed,
      activeStaffId
    );

    stopCamera();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="courier-intake-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="card-lift glass-card relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface text-foreground rounded-3xl p-6 sm:p-8 shadow-2xl border border-border space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          aria-label="Close courier intake dialog"
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="courier-intake-title" className="text-xl font-extrabold text-foreground tracking-tight">
                Courier Parcel Intake Bay
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {parcel.carrier}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Physical Ingestion & Zero-Credit Envelope Payout
            </p>
          </div>
        </div>

        {/* Target Consignment Header */}
        <div className="p-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Target Waybill
            </span>
            <p className="text-base font-mono font-bold text-foreground mt-0.5">
              {parcel.waybill_number}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Stashed Envelope Cash
            </span>
            <p className="text-base font-mono font-bold text-success mt-0.5">
              ₱{parcel.cash_deposited.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Step 1: AI Visual Precheck (if enabled) */}
        {staffIntakeAi && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span>Step 1: Visual Waybill Verification</span>
              </span>
              {aiResult && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Match Confirmed
                </span>
              )}
            </div>

            {/* Viewfinder HUD */}
            <div className="relative aspect-video rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border">
              {cameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="laser-scanline" />
                </>
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured Parcel" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Position courier package inside camera frame.</p>
                </div>
              )}
            </div>

            {/* Camera Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {cameraActive ? (
                <>
                  <button
                    type="button"
                    onClick={captureFrame}
                    aria-label="Capture frame from live camera"
                    className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary-hover flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    aria-label="Cancel live camera stream"
                    className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted hover:bg-surface-elevated text-foreground border border-border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startCamera}
                    aria-label="Open camera viewfinder"
                    className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload photo from disk"
                    className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted hover:bg-surface-elevated text-foreground border border-border flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={useSamplePhoto}
                    aria-label="Use sample parcel photo for simulation"
                    className="px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Sample Photo
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                id="courier-modal-file-upload"
                aria-label="Upload parcel photo"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Run Gemini Inference */}
            {capturedImage && (
              <button
                type="button"
                onClick={runAiVerification}
                disabled={verifying}
                aria-label="Run Gemini AI visual verification"
                className="relative inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
              >
                <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <Sparkles className="relative z-10 w-4 h-4" />
                <span className="relative z-10">
                  {verifying ? 'Inference Running (Gemini)...' : 'Run Gemini AI Verification'}
                </span>
              </button>
            )}

            {/* AI Results */}
            {aiResult && (
              <div className="p-4 rounded-2xl bg-success-subtle border border-success/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-success">Waybill Match Validated</span>
                  <span className="font-mono font-bold text-success">
                    {(aiResult.confidence_score * 100).toFixed(1)}% Match
                  </span>
                </div>
                <p className="text-foreground">
                  Detected: <span className="font-mono font-bold">{aiResult.waybill_number}</span> · Condition: <strong>{aiResult.package_condition}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Exact Cash Payout */}
        <div className="space-y-3 pt-2 border-t border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-primary" />
            <span>Step 2: Courier COD Disbursal</span>
          </span>

          <div className="space-y-1.5">
            <label htmlFor="intake-exact-amount" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Exact Cash Amount Disbursed to Courier (PHP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground font-mono">
                ₱
              </span>
              <input
                id="intake-exact-amount"
                aria-label="Exact Amount Disbursed to Courier in PHP"
                type="number"
                step="0.5"
                value={exactPaidAmount}
                onChange={(e) => setExactPaidAmount(e.target.value)}
                placeholder={parcel.cod_amount.toString()}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-surface-elevated border border-border text-base font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleCommit}
            disabled={!canProceedToPaymentType || !exactPaidAmount}
            aria-label="Commit parcel intake transition to RECEIVED_LOGGED"
            className="relative inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40 shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
          >
            <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <CheckCircle className="relative z-10 w-4 h-4" />
            <span className="relative z-10">
              Commit Intake & Disburse Cash to Courier
            </span>
          </button>

          {!canProceedToPaymentType && (
            <p className="text-[11px] text-warning text-center font-medium">
              ⚠ Staff AI Precheck is enabled: please scan package with camera and verify waybill before disbursing.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Cancel and close dialog"
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
