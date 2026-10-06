'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  UploadCloud,
  FileText,
  Lock,
  Building,
  Award,
  Check,
} from 'lucide-react';

interface PartnerVerificationTabProps {
  verificationStatus: string;
  partnerDetails: any;
}

export default function PartnerVerificationTab({
  verificationStatus,
  partnerDetails,
}: PartnerVerificationTabProps) {
  const isApproved = verificationStatus === 'APPROVED' || verificationStatus === 'VERIFIED';
  const [doc1Uploaded, setDoc1Uploaded] = useState(true);
  const [doc2Uploaded, setDoc2Uploaded] = useState(true);
  const [doc3Uploaded, setDoc3Uploaded] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadSimulate = (docNum: number) => {
    if (docNum === 3) setDoc3Uploaded(true);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#171717]">Provider Trust & Verification Center</h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isApproved ? 'VERIFIED PARTNER' : 'VERIFICATION IN PROGRESS'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified providers receive top circuit recommendation ranking, safety badges, and direct tourist booking
          permissions.
        </p>
      </div>

      {uploadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Document uploaded and submitted to the regional verification queue.
        </div>
      )}

      {/* Main Status Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#171717]">
                  {isApproved ? 'Identity & Credentials Verified' : 'Documents Under Review'}
                </h3>
                <span className="text-xs text-slate-400">· Circuit Level A</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isApproved
                  ? 'Your identity documents, destination knowledge, and credential records have been approved by YatraSetu Trust & Safety team.'
                  : 'Your submitted credentials are being reviewed by the regional verification desk. Most reviews complete within 24 hours.'}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Required Verification Records</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ID Proof */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified
                </span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">Identity Document</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Govt Photo ID (Aadhaar / Passport / Voter ID)</p>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                ✓ Identity Verified
              </div>
            </div>

            {/* Category Credential */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified
                </span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">Category Credential</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Guide License, Artisan Card, or Tourism Accreditation</p>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                ✓ Credential Verified
              </div>
            </div>

            {/* Business Registration */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <Building className="w-5 h-5 text-teal-600" />
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc3Uploaded ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {doc3Uploaded ? 'Uploaded' : 'Optional'}
                </span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171717]">Business / Tax ID</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">GSTIN / Udyam Certificate (for commercial stays)</p>
              </div>
              {doc3Uploaded ? (
                <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  ✓ Document On File
                </div>
              ) : (
                <button
                  onClick={() => handleUploadSimulate(3)}
                  className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Upload Document
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
