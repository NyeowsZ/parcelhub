'use client';

import React, { useState, useRef } from 'react';
import { ParcelRow } from '@/types/database';
import { Camera, Upload, CheckCircle, Cpu, Sparkles } from 'lucide-react';
import { StaffSession } from '../StaffAuthModal';

interface IntakeTabProps {
  parcels: ParcelRow[];
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

export const IntakeTab: React.FC<IntakeTabProps> = ({
  parcels,
  staffIntakeAi,
  staffSession,
  onCommitIntake,
}) => {
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [exactPaidAmount, setExactPaidAmount] = useState<string>('');
  const [, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Eligible parcels are those in FUNDED state (cash secured in envelope!)
  const fundedParcels = parcels.filter((p) => p.current_status === 'FUNDED');
  const selectedParcel = parcels.find((p) => p.parcel_id === selectedParcelId);

  // When parcel selected, pre-populate exact paid amount with declared COD
  const handleSelectParcel = (parcel: ParcelRow) => {
    setSelectedParcelId(parcel.parcel_id);
    setExactPaidAmount(parcel.cod_amount.toString());
    setCapturedImage(null);
    setAiResult(null);
  };

  // Start live WebRTC counter camera
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

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture frame from webcam
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

  // Handle file upload
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

  // Run Gemini Intake Verification
  const runAiVerification = async () => {
    if (!capturedImage || !selectedParcel) return;

    try {
      setVerifying(true);
      const res = await fetch('/api/verify-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          expectedWaybill: selectedParcel.waybill_number,
          parcelId: selectedParcel.parcel_id,
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

  // Commit transition to RECEIVED_LOGGED
  const handleCommit = () => {
    if (!selectedParcel) return;

    const condition = aiResult?.package_condition || 'INTACT';
    const waybill = aiResult?.waybill_number || selectedParcel.waybill_number;
    const confidence = aiResult?.confidence_score || 0.95;
    const exactDisbursed = parseFloat(exactPaidAmount) || selectedParcel.cod_amount;
    const activeStaffId = staffSession?.staffId || 'STAFF-0488';

    onCommitIntake(
      selectedParcel.parcel_id,
      waybill,
      condition,
      confidence,
      capturedImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
      exactDisbursed,
      activeStaffId
    );

    setSelectedParcelId('');
    setCapturedImage(null);
    setAiResult(null);
    setExactPaidAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Courier Handover & Parcel Intake Logging</span>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              State: FUNDED → RECEIVED_LOGGED
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Accept package from courier, verify waybill, disburse exact cash from sealed envelope, and notify student.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full border border-border text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Staff AI Precheck:</span>
            <span className={`font-bold ${staffIntakeAi ? 'text-primary' : 'text-warning'}`}>
              {staffIntakeAi ? 'ENABLED' : 'MANUAL BYPASS'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full border border-border text-xs font-semibold">
            <span className="text-muted-foreground">Operator:</span>
            <span className="text-foreground font-mono font-bold text-[11px]">{staffSession?.staffId || 'STAFF-0488'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 1. Select Funded Parcel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              1. Select Arrival Consignment
            </h3>

            {fundedParcels.length === 0 ? (
              <div className="p-8 text-center bg-muted/40 rounded-2xl border border-border">
                <p className="text-xs font-semibold text-foreground">
                  No funded envelopes awaiting courier right now.
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Parcels must be in <strong>FUNDED</strong> state with cash secured in envelopes.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {fundedParcels.map((p) => {
                  const isSelected = p.parcel_id === selectedParcelId;
                  return (
                    <button
                      key={p.parcel_id}
                      type="button"
                      onClick={() => handleSelectParcel(p)}
                      aria-label={`Select arrival consignment for waybill ${p.waybill_number}`}
                      className={`w-full text-left p-4 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                          : 'border-border hover:border-primary/40 bg-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {p.waybill_number}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {p.carrier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{p.recipient_name || 'Student Recipient'}</span>
                        <span className="font-mono font-bold text-foreground">
                          COD: ₱{p.cod_amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Cash in Envelope:</span>
                        <span className="font-mono font-semibold text-success">
                          ₱{p.cash_deposited.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 2. AI Precheck & Exact Amount Paid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!selectedParcel ? (
            <div className="card-lift glass-card p-12 text-center rounded-2xl bg-surface border border-dashed border-border">
              <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-foreground">
                Select an arrival consignment on the left to begin intake.
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {staffIntakeAi
                  ? 'Initiate scan to verify waybill optical match before paying courier.'
                  : 'AI precheck disabled on server: you can inspect and type exact amount paid.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 1: AI Scanning (if enabled) */}
              {staffIntakeAi && (
                <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Step 1: Scan Parcel & Waybill (AI Precheck)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target Waybill: <strong className="font-mono text-foreground">{selectedParcel.waybill_number}</strong>
                      </p>
                    </div>

                    {aiResult && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-success-subtle text-success border border-success/30 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        OCR VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Camera / Image Preview */}
                  <div className="relative aspect-video rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border">
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : capturedImage ? (
                      <img src={capturedImage} alt="Captured Parcel" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 text-muted-foreground">
                        <Camera className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No parcel frame captured yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
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
                          Use Sample Photo
                        </button>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      id="parcel-image-upload"
                      aria-label="Upload parcel photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Run AI Verification */}
                  {capturedImage && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={runAiVerification}
                        disabled={verifying}
                        aria-label="Run Gemini AI visual precheck"
                        className="relative inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
                      >
                        <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        <Sparkles className="relative z-10 w-4 h-4" />
                        <span className="relative z-10">
                          {verifying ? 'Inference Running (Gemini)...' : 'Run Gemini AI Precheck'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* AI Results */}
                  {aiResult && (
                    <div className="p-4 rounded-2xl bg-success-subtle border border-success/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-success">AI Waybill Match Succeeded</span>
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

              {/* Step 2: Courier Payout & Commit */}
              <div className="card-lift glass-card p-6 rounded-2xl bg-surface border border-border space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {staffIntakeAi ? 'Step 2: Type Exact Cash Amount Paid to Courier' : 'Step 1: Type Exact Cash Amount Paid to Courier'}
                </h3>

                <div className="p-4 rounded-2xl bg-surface-elevated border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Envelope Stashed Cash
                    </span>
                    <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                      ₱{selectedParcel.cash_deposited.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Expected COD
                    </span>
                    <p className="text-lg font-mono font-bold text-foreground mt-0.5">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="exact-disbursed-amount" className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Exact Amount Disbursed to Courier (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-muted-foreground font-mono">
                      ₱
                    </span>
                    <input
                      id="exact-disbursed-amount"
                      aria-label="Exact Amount Disbursed to Courier in PHP"
                      type="number"
                      step="0.5"
                      value={exactPaidAmount}
                      onChange={(e) => setExactPaidAmount(e.target.value)}
                      placeholder={selectedParcel.cod_amount.toString()}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-surface-elevated border border-border text-base font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Commit Action */}
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={!canProceedToPaymentType || !exactPaidAmount}
                  aria-label="Commit parcel intake transition to RECEIVED_LOGGED"
                  className="relative inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40 shadow-[0_4px_16px_rgba(217,38,26,0.35)] transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
                >
                  <span className="absolute inset-0 pointer-events-none -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <CheckCircle className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">
                    Commit Intake & Notify Student (RECEIVED_LOGGED)
                  </span>
                </button>

                {!canProceedToPaymentType && (
                  <p className="text-[11px] text-warning text-center font-medium">
                    ⚠ Staff AI Precheck is enabled on server: please scan parcel with camera and verify waybill before disbursing.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
