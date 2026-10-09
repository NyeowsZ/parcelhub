'use client';

import React, { useState, useRef } from 'react';
import { ParcelRow } from '@/types/database';
import { Camera, Upload, CheckCircle, AlertOctagon, Cpu, ShieldCheck, Sparkles, Banknote } from 'lucide-react';
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
  const [cameraError, setCameraError] = useState<string | null>(null);

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
      <div className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <span>Courier Handover & Parcel Intake Logging</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
              State: FUNDED → RECEIVED_LOGGED
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Accept package from courier, verify waybill, disburse exact cash from sealed envelope, and notify student.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">Staff AI Precheck:</span>
            <span className={`font-bold ${staffIntakeAi ? 'text-blue-700' : 'text-amber-700'}`}>
              {staffIntakeAi ? 'ENABLED' : 'DISABLED (MANUAL TYPING)'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-semibold">
            <span className="text-slate-600">Operator:</span>
            <span className="text-blue-700 font-mono font-bold text-[11px]">{staffSession?.staffId || 'STAFF-0488'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 1. Select Funded Parcel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-card p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              1. Select Arrival Consignment
            </h3>

            {fundedParcels.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-600">
                  No funded envelopes awaiting courier right now.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Parcels must be in <strong>FUNDED</strong> state with cash secured in envelopes.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {fundedParcels.map((p) => {
                  const isSelected = p.parcel_id === selectedParcelId;
                  return (
                    <button
                      key={p.parcel_id}
                      onClick={() => handleSelectParcel(p)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-[#0F172A]">
                          {p.waybill_number}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          {p.carrier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{p.recipient_name || 'Student Recipient'}</span>
                        <span className="font-mono font-bold text-slate-900">
                          COD: ₱{p.cod_amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Cash in Envelope:</span>
                        <span className="font-mono font-semibold text-emerald-700">
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
            <div className="surface-card p-12 text-center border-dashed border-2">
              <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Select an arrival consignment on the left to begin intake.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {staffIntakeAi
                  ? 'Initiate scan to verify waybill optical match before paying courier.'
                  : 'AI precheck disabled on server: you can inspect and type exact amount paid.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 1: AI Scanning (if enabled) */}
              {staffIntakeAi && (
                <div className="surface-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Step 1: Scan Parcel & Waybill (AI Precheck)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Target Waybill: <strong className="font-mono text-slate-900">{selectedParcel.waybill_number}</strong>
                      </p>
                    </div>

                    {aiResult && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        OCR VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Camera / Image Preview */}
                  <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center">
                    {cameraActive ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : capturedImage ? (
                      <img src={capturedImage} alt="Captured Parcel" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No parcel frame captured yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {cameraActive ? (
                      <>
                        <button
                          onClick={captureFrame}
                          className="px-4 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Capture Frame</span>
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Open Camera</span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                        <button
                          onClick={useSamplePhoto}
                          className="px-3.5 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Use Sample Photo
                        </button>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
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
                        onClick={runAiVerification}
                        disabled={verifying}
                        className="w-full h-11 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{verifying ? 'Inference Running (Gemini)...' : 'Run Gemini AI Precheck'}</span>
                      </button>
                    </div>
                  )}

                  {/* AI Results */}
                  {aiResult && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">AI Waybill Match Succeeded</span>
                        <span className="font-mono font-bold text-emerald-700">{(aiResult.confidence_score * 100).toFixed(1)}% Match</span>
                      </div>
                      <p className="text-slate-600">
                        Detected: <span className="font-mono font-bold">{aiResult.waybill_number}</span> · Condition: <strong>{aiResult.package_condition}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Courier Payout & Commit */}
              <div className="surface-card p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {staffIntakeAi ? 'Step 2: Type Exact Cash Amount Paid to Courier' : 'Step 1: Type Exact Cash Amount Paid to Courier'}
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Envelope Stashed Cash</span>
                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                      ₱{selectedParcel.cash_deposited.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Expected COD</span>
                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                      ₱{selectedParcel.cod_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Exact Amount Disbursed to Courier (PHP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm font-bold text-slate-400 font-mono">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={exactPaidAmount}
                      onChange={(e) => setExactPaidAmount(e.target.value)}
                      placeholder={selectedParcel.cod_amount.toString()}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Commit Action */}
                <button
                  onClick={handleCommit}
                  disabled={!canProceedToPaymentType || !exactPaidAmount}
                  className="w-full h-12 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-40 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Update Status to Ready (RECEIVED_LOGGED) & Push Prompt to User</span>
                </button>

                {!canProceedToPaymentType && (
                  <p className="text-[11px] text-amber-700 text-center font-medium">
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
