'use client';

import React, { useState, useRef } from 'react';
import { ParcelRow, VisualLogRow } from '@/types/database';
import { Camera, Upload, CheckCircle, AlertOctagon, Cpu, ShieldCheck, Eye, Sparkles } from 'lucide-react';

interface IntakeTabProps {
  parcels: ParcelRow[];
  aiRequired: boolean;
  onCommitIntake: (
    parcelId: string,
    extractedWaybill: string,
    condition: 'INTACT' | 'DAMAGED' | 'TAMPERED',
    confidence: number,
    imageUri: string
  ) => void;
}

export const IntakeTab: React.FC<IntakeTabProps> = ({
  parcels,
  aiRequired,
  onCommitIntake,
}) => {
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Eligible parcels are those in FUNDED state (cash is secured in envelope!)
  const fundedParcels = parcels.filter((p) => p.current_status === 'FUNDED');
  const selectedParcel = parcels.find((p) => p.parcel_id === selectedParcelId);

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
      setCameraError('Webcam not accessible or permission denied. You can upload an image or use sample intake photo.');
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

  // Use realistic demo parcel sample
  const useSamplePhoto = () => {
    setCapturedImage('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80');
    setAiResult(null);
  };

  // Run Gemini 3.5 Flash-Lite Verification
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

  // Commit transition to RECEIVED_LOGGED
  const handleCommit = () => {
    if (!selectedParcel) return;

    const condition = aiResult?.package_condition || 'INTACT';
    const waybill = aiResult?.waybill_number || selectedParcel.waybill_number;
    const confidence = aiResult?.confidence_score || 0.95;

    onCommitIntake(
      selectedParcel.parcel_id,
      waybill,
      condition,
      confidence,
      capturedImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'
    );

    // Reset view
    setSelectedParcelId('');
    setCapturedImage(null);
    setAiResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Courier Handover & AI Intake Logging</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              State: FUNDED → RECEIVED_LOGGED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Accept package from courier, disburse envelope cash, execute visual intake audit with Gemini 3.5 Flash-Lite, and notify student.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300">Policy Gate:</span>
          <span className={`font-bold ${aiRequired ? 'text-blue-400' : 'text-amber-400'}`}>
            {aiRequired ? 'STRICT OCR MATCH' : 'MANUAL BYPASS ALLOWED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 1. Select Funded Parcel & Envelope Disbursal (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="terminal-card p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              1. Select Arrival Consignment
            </h3>

            {fundedParcels.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400">
                  No funded envelopes awaiting courier delivery right now.
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
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
                      onClick={() => {
                        setSelectedParcelId(p.parcel_id);
                        setAiResult(null);
                      }}
                      className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-950/50'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white">{p.carrier}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          ₱{p.cod_amount.toFixed(2)} COD
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        Waybill: <span className="text-slate-200">{p.waybill_number}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Envelope contains: ₱{p.cash_deposited.toFixed(2)} (Exact COD + Change)
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Zero-Knowledge Courier Payout Slip */}
          {selectedParcel && (
            <div className="terminal-card p-5 border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Courier Payout Handover (Zero-Knowledge)
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Courier sees only tracking number and exact cash payable. Student identity is strictly zero-knowledge.
              </p>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Waybill:</span>
                  <span className="font-mono font-bold text-white">{selectedParcel.waybill_number}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                  <span className="font-semibold text-amber-400">Cash to Disburse Courier:</span>
                  <span className="text-lg font-mono font-extrabold text-amber-400">
                    ₱{selectedParcel.cod_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 2. Visual Intake & AI Verification (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="terminal-card p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              2. Optical Intake Camera & Gemini Verification
            </h3>

            {/* Viewfinder / Preview Box */}
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="scanline" />
                  <div className="absolute top-4 left-4 bg-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE DESK WEBCAM
                  </div>
                </>
              ) : capturedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={capturedImage}
                    alt="Intake Preview"
                    className="w-full h-full object-contain bg-slate-950"
                  />
                  {verifying && <div className="scanline" />}
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Counter camera standby. Align package label inside frame.
                  </p>
                </div>
              )}

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-4 pointer-events-none border border-slate-700/40 rounded-xl" />
            </div>

            {cameraError && (
              <p className="text-[11px] text-amber-400 mt-2">{cameraError}</p>
            )}

            {/* Camera Controls */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {cameraActive ? (
                <>
                  <button
                    onClick={captureFrame}
                    className="px-4 py-2 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Counter Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    onClick={useSamplePhoto}
                    className="px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    Use Sample Package
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

            {/* AI Run CTA */}
            {capturedImage && selectedParcel && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={runAiVerification}
                  disabled={verifying}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Cpu className="w-4 h-4" />
                  <span>
                    {verifying ? 'Inference Running (Gemini)...' : 'Run Gemini 3.5 AI Audit'}
                  </span>
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  Target: {selectedParcel.waybill_number}
                </span>
              </div>
            )}
          </div>

          {/* AI Results & Commit Card */}
          {aiResult && selectedParcel && (
            <div className="terminal-card p-5 border-blue-500/60 bg-slate-950/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Gemini Multimodal Audit Report
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  Confidence: {(aiResult.confidence_score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Detected Waybill</span>
                  <p className="font-mono font-bold text-white mt-1">
                    {aiResult.waybill_number || 'Not extracted'}
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Package Condition</span>
                  <p className="font-bold text-emerald-400 mt-1">
                    {aiResult.package_condition}
                  </p>
                </div>
              </div>

              {/* Waybill Match Validation */}
              {aiResult.waybill_number === selectedParcel.waybill_number ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Exact Waybill Match:</strong> Optical OCR matches declared consignment!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>
                    Waybill mismatch: Expected <strong>{selectedParcel.waybill_number}</strong>.
                    {!aiRequired && ' (Manual override active)'}
                  </span>
                </div>
              )}

              {/* Commit Action */}
              <button
                onClick={handleCommit}
                className="w-full py-3 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Commit Intake & Dispatch Expo Push to Student</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
