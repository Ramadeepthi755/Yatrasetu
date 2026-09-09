'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  ShieldCheck,
  Linkedin,
  Instagram,
  MapPin,
  FileCheck,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Home,
  Calendar,
  Fingerprint,
  Lock,
} from 'lucide-react';

type OnboardingStep = 'social' | 'digilocker' | 'residency' | 'review';

export default function GuideOnboardingPage() {
  const router = useRouter();
  const { user, setGuideVerification } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('social');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Social profiles
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  // DigiLocker
  const [dgLockerVerified, setDgLockerVerified] = useState(false);
  const [dgLockerConnecting, setDgLockerConnecting] = useState(false);
  const [aadhaarLast4, setAadhaarLast4] = useState('');

  // Residency proof
  const [residencyCity, setResidencyCity] = useState('');
  const [residencyYears, setResidencyYears] = useState('');
  const [residencyProofFile, setResidencyProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const steps: { id: OnboardingStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'social', label: 'Social Profiles', icon: Linkedin },
    { id: 'digilocker', label: 'DigiLocker Verification', icon: ShieldCheck },
    { id: 'residency', label: 'Residency Proof', icon: Home },
    { id: 'review', label: 'Review & Submit', icon: FileCheck },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const handleDigiLocker = async () => {
    setDgLockerConnecting(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setDgLockerConnecting(false);
    setDgLockerVerified(true);
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setGuideVerification({
      linkedinUrl,
      instagramUrl,
      dgLockerVerified,
      aadhaarLast4,
      residencyProof: residencyProofFile?.name || 'submitted',
      residencyYears: parseInt(residencyYears) || 0,
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center animate-[logoPulse_2s_ease-in-out_infinite]">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#171717]">Application Submitted!</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your guide application is <span className="font-bold text-amber-600">pending verification</span>. 
            Our team will review your documents and social profiles. You&apos;ll receive an update within 24-48 hours.
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left space-y-3">
            <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">While you wait:</h3>
            <ul className="space-y-2">
              {[
                'You can explore the platform as a traveler',
                'Your guide dashboard will be unlocked after verification',
                'You cannot apply or accept guide requests until verified',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#312E81] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 mx-auto"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Guide Registration</h1>
              <p className="text-xs text-teal-200">Complete verification to become a YatraSetu guide</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < currentStepIndex
                      ? 'bg-white border-white text-[#0F766E]'
                      : i === currentStepIndex
                      ? 'border-white text-white bg-white/20'
                      : 'border-white/30 text-white/40 bg-transparent'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-[10px] font-semibold hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${i < currentStepIndex ? 'bg-white' : 'bg-white/20'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Social Profiles */}
        {step === 'social' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">Social Profiles</h2>
              <p className="text-sm text-slate-500 mt-1">We verify your online presence to ensure authenticity</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  LinkedIn Profile URL <span className="text-slate-400 normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Instagram Profile URL <span className="text-slate-400 normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-500">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <p className="text-xs text-teal-700"><strong>Why do we need this?</strong> Your social profiles help travelers trust you and build credibility as a verified guide.</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setError(null);
                  setStep('digilocker');
                }}
                className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
              >
                Next: DigiLocker <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: DigiLocker */}
        {step === 'digilocker' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">DigiLocker Verification</h2>
              <p className="text-sm text-slate-500 mt-1">Government-backed identity verification</p>
            </div>

            {dgLockerVerified ? (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800">DigiLocker Connected</h3>
                    <p className="text-xs text-emerald-600">Identity verified successfully via DigiLocker</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-blue-800 font-medium">DigiLocker will verify:</p>
                  <ul className="text-[11px] text-blue-700 space-y-1">
                    <li>• Your Aadhaar card details</li>
                    <li>• PAN card (if available)</li>
                    <li>• Address verification</li>
                  </ul>
                </div>

                <button
                  onClick={handleDigiLocker}
                  disabled={dgLockerConnecting}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {dgLockerConnecting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Connecting to DigiLocker...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4" />Connect DigiLocker</>
                  )}
                </button>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">
                    Aadhaar last 4 digits <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Do not enter your full Aadhaar number"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep('social')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setStep('residency');
                }}
                className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
              >
                Next: Residency <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Residency Proof */}
        {step === 'residency' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">Residency Proof</h2>
              <p className="text-sm text-slate-500 mt-1">Prove you&apos;ve lived in your city for at least 3 years</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">City of Residence <span className="text-slate-400 normal-case">(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={residencyCity}
                    onChange={(e) => setResidencyCity(e.target.value)}
                    placeholder="e.g., Hampi, Jaipur, Varanasi"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Years of Residence <span className="text-slate-400 normal-case">(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="3"
                    value={residencyYears}
                    onChange={(e) => setResidencyYears(e.target.value)}
                    placeholder="Minimum 3 years"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                  />
                </div>
                {residencyYears && parseInt(residencyYears) < 3 && (
                  <p className="text-[10px] text-rose-500 mt-1 font-medium">Minimum 3 years of residency required</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Proof Document <span className="text-slate-400 normal-case">(optional)</span>
                </label>
                <p className="text-[10px] text-slate-400 mb-2">Upload utility bill, voter ID, or rental agreement showing 3+ years</p>
                <div
                  onClick={() => document.getElementById('residency-proof-input')?.click()}
                  className={`upload-zone rounded-2xl p-6 text-center cursor-pointer ${residencyProofFile ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
                >
                  <input
                    id="residency-proof-input"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setResidencyProofFile(file);
                    }}
                  />
                  {residencyProofFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 font-medium">
                      <FileCheck className="w-4 h-4" />
                      {residencyProofFile.name}
                      <button
                        onClick={(e) => { e.stopPropagation(); setResidencyProofFile(null); }}
                        className="ml-2 text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs text-slate-500">Click to upload proof document</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('digilocker')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setStep('review');
                }}
                className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
              >
                Review Application <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">Review Your Application</h2>
              <p className="text-sm text-slate-500 mt-1">Verify all details before submitting</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
              <div className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Social Profiles</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs truncate">{linkedinUrl}</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline text-xs truncate">{instagramUrl}</a>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Identity Verification</h3>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">DigiLocker Connected</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Residency</h3>
                <div className="space-y-1.5">
                  <p className="text-xs text-[#171717]"><strong>City:</strong> {residencyCity}</p>
                  <p className="text-xs text-[#171717]"><strong>Years:</strong> {residencyYears} years</p>
                  <p className="text-xs text-[#171717]"><strong>Proof:</strong> {residencyProofFile?.name}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Application will be reviewed within 24-48 hours</p>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  Your dashboard will be accessible but guide features will remain locked until verification is complete.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('residency')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" />Submit Application</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
