'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Upload,
  FileCheck,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Fingerprint,
  Eye,
  Loader2,
  Lock,
} from 'lucide-react';

interface AadhaarVerificationProps {
  onVerified: (data: {
    method: 'digilocker' | 'upload';
    aadhaarNumber?: string;
    fileName?: string;
    verified: boolean;
  }) => void;
  initialVerified?: boolean;
}

export default function AadhaarVerification({ onVerified, initialVerified = false }: AadhaarVerificationProps) {
  const [method, setMethod] = useState<'select' | 'digilocker' | 'upload'>('select');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(initialVerified);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dgLockerConnecting, setDgLockerConnecting] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<{
    name?: string;
    number?: string;
    dob?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleDigiLocker = async () => {
    setDgLockerConnecting(true);
    setError(null);
    
    // Simulate DigiLocker OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setDgLockerConnecting(false);
    setVerifying(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const extractedData = {
      name: 'Verified via DigiLocker',
      number: 'XXXX XXXX ' + Math.floor(1000 + Math.random() * 9000),
      dob: '1995-06-15',
    };
    
    setExtractedDetails(extractedData);
    setVerified(true);
    setVerifying(false);
    onVerified({
      method: 'digilocker',
      aadhaarNumber: extractedData.number,
      verified: true,
    });
  };

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    setError(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleVerifyUpload = async () => {
    if (!uploadedFile && !aadhaarNumber.replace(/\s/g, '')) {
      setError('Please upload your Aadhaar card or enter Aadhaar number');
      return;
    }

    const cleanNumber = aadhaarNumber.replace(/\s/g, '');
    if (cleanNumber && cleanNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setVerifying(true);
    setError(null);

    // Simulate OCR / verification
    await new Promise(resolve => setTimeout(resolve, 2200));

    const last4 = cleanNumber ? cleanNumber.slice(-4) : String(Math.floor(1000 + Math.random() * 9000));
    const extractedData = {
      name: 'Aadhaar Holder',
      number: 'XXXX XXXX ' + last4,
      dob: '—',
    };

    setExtractedDetails(extractedData);
    setVerified(true);
    setVerifying(false);
    onVerified({
      method: 'upload',
      aadhaarNumber: extractedData.number,
      fileName: uploadedFile?.name,
      verified: true,
    });
  };

  if (verified && extractedDetails) {
    return (
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-800">Aadhaar Verified</h3>
            <p className="text-xs text-emerald-600">Identity confirmed successfully</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-emerald-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Aadhaar</p>
            <p className="text-sm font-mono font-bold text-[#171717]">{extractedDetails.number}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-emerald-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Method</p>
            <p className="text-sm font-semibold text-[#171717] capitalize">{method === 'digilocker' ? 'DigiLocker' : 'Document Upload'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-600">
          <Lock className="w-3 h-3" />
          <span>Your Aadhaar data is encrypted and stored securely</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Fingerprint className="w-5 h-5 text-[#312E81]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#171717]">Aadhaar Verification</h3>
          <p className="text-xs text-slate-500">Verify your identity using DigiLocker or upload</p>
        </div>
      </div>

      {/* Method Selection */}
      {method === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* DigiLocker Option */}
          <button
            type="button"
            onClick={() => setMethod('digilocker')}
            className="relative p-5 rounded-2xl border-2 border-slate-200 hover:border-[#312E81] bg-white text-left transition-all group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#171717]">DigiLocker</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Connect your DigiLocker account for instant, government-verified identity
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                Recommended <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
          </button>

          {/* Upload Option */}
          <button
            type="button"
            onClick={() => setMethod('upload')}
            className="relative p-5 rounded-2xl border-2 border-slate-200 hover:border-[#312E81] bg-white text-left transition-all group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Upload className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#171717]">Upload Aadhaar</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Upload a photo or scan of your Aadhaar card (front side)
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                Manual verification
              </span>
            </div>
          </button>
        </div>
      )}

      {/* DigiLocker Flow */}
      {method === 'digilocker' && !verified && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              DigiLocker Verification
            </h4>
            <button onClick={() => setMethod('select')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-xs text-blue-800 font-medium">How it works:</p>
            <ol className="text-[11px] text-blue-700 space-y-1">
              <li>1. Connect to your DigiLocker account</li>
              <li>2. Authorize YatraSetu to access your Aadhaar</li>
              <li>3. Verification happens instantly</li>
            </ol>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDigiLocker}
            disabled={dgLockerConnecting || verifying}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {dgLockerConnecting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Connecting to DigiLocker...</>
            ) : verifying ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Verifying Aadhaar...</>
            ) : (
              <><ExternalLink className="w-4 h-4" />Connect DigiLocker</>
            )}
          </button>
        </div>
      )}

      {/* Upload Flow */}
      {method === 'upload' && !verified && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600" />
              Upload Aadhaar Card
            </h4>
            <button onClick={() => { setMethod('select'); setUploadedFile(null); setPreview(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Aadhaar Number Input */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
              Aadhaar Number (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Fingerprint className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm tracking-wider"
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`upload-zone rounded-2xl p-8 text-center cursor-pointer transition-all ${
              uploadedFile ? 'border-emerald-300 bg-emerald-50/30 active' : ''
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {uploadedFile ? (
              <div className="space-y-3">
                {preview && (
                  <div className="relative w-40 h-28 mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={preview} alt="Aadhaar preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 font-medium">
                  <FileCheck className="w-4 h-4" />
                  {uploadedFile.name}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setPreview(null);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Remove & re-upload
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#171717]">Drop your Aadhaar card here</p>
                  <p className="text-xs text-slate-400 mt-1">or click to browse • JPG, PNG, PDF up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleVerifyUpload}
            disabled={verifying || (!uploadedFile && !aadhaarNumber.replace(/\s/g, ''))}
            className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Detecting & Verifying...</>
            ) : (
              <><ShieldCheck className="w-4 h-4" />Verify Aadhaar</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
