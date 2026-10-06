'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Upload,
  FileCheck,
  Camera,
  Receipt,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Star,
} from 'lucide-react';

type HotelStep = 'details' | 'photos' | 'proofs' | 'review';

export default function HotelOnboardingPage() {
  const router = useRouter();
  const { user, setHotelVerification } = useAuth();
  const [step, setStep] = useState<HotelStep>('details');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hotel details
  const [hotelName, setHotelName] = useState('');
  const [hotelCity, setHotelCity] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelPhone, setHotelPhone] = useState('');
  const [hotelEmail, setHotelEmail] = useState('');
  const [hotelWebsite, setHotelWebsite] = useState('');
  const [hotelType, setHotelType] = useState('');
  const [totalRooms, setTotalRooms] = useState('');

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Proofs
  const [billingReceipts, setBillingReceipts] = useState<File[]>([]);
  const [businessProofs, setBusinessProofs] = useState<File[]>([]);

  const steps: { id: HotelStep; label: string }[] = [
    { id: 'details', label: 'Hotel Details' },
    { id: 'photos', label: 'Property Photos' },
    { id: 'proofs', label: 'Business Proofs' },
    { id: 'review', label: 'Review' },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === step);

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).slice(0, 10 - photos.length);
    setPhotos(prev => [...prev, ...newPhotos]);
    newPhotos.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (files: FileList | null, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (!files) return;
    setter(prev => [...prev, ...Array.from(files)]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setHotelVerification({
      hotelName,
      hotelCity,
      hotelAddress,
      hotelPhone,
      hotelEmail,
      hotelWebsite,
      hotelType,
      totalRooms,
      photos: photos.map(f => f.name),
      billingReceipts: billingReceipts.map(f => f.name),
      businessProofs: businessProofs.map(f => f.name),
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
          <h1 className="text-2xl font-extrabold text-[#171717]">Hotel Registration Submitted!</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your hotel listing is <span className="font-bold text-amber-600">pending verification</span>. 
            Our team will review your property photos and business documents.
          </p>
          <button
            onClick={() => router.push('/partner/dashboard')}
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
      <div className="bg-gradient-to-r from-[#312E81] to-[#1E1B4B] text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Hotel Registration</h1>
              <p className="text-xs text-indigo-200">Register your property on YatraSetu</p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < currentStepIndex ? 'bg-white border-white text-[#312E81]'
                    : i === currentStepIndex ? 'border-white text-white bg-white/20'
                    : 'border-white/30 text-white/40'
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] font-semibold hidden sm:inline">{s.label}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${i < currentStepIndex ? 'bg-white' : 'bg-white/20'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        {/* Step 1: Hotel Details */}
        {step === 'details' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-extrabold text-[#171717]">Hotel Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Hotel / Property Name <span className="text-slate-400 normal-case">(optional)</span></label>
                <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} placeholder="e.g., Heritage Palace Hotel"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">City <span className="text-slate-400 normal-case">(optional)</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={hotelCity} onChange={(e) => setHotelCity(e.target.value)} placeholder="e.g., Jaipur"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Property Type <span className="text-slate-400 normal-case">(optional)</span></label>
                <select value={hotelType} onChange={(e) => setHotelType(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm">
                  <option value="">Select type</option>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="homestay">Homestay</option>
                  <option value="heritage">Heritage Stay</option>
                  <option value="boutique">Boutique Hotel</option>
                  <option value="lodge">Lodge / Guest House</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Full Address <span className="text-slate-400 normal-case">(optional)</span></label>
                <textarea value={hotelAddress} onChange={(e) => setHotelAddress(e.target.value)} rows={2} placeholder="Street address, area, landmark"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={hotelPhone} onChange={(e) => setHotelPhone(e.target.value)} placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={hotelEmail} onChange={(e) => setHotelEmail(e.target.value)} placeholder="hotel@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Total Rooms</label>
                <input type="number" value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} placeholder="e.g., 25"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="url" value={hotelWebsite} onChange={(e) => setHotelWebsite(e.target.value)} placeholder="https://yourhotel.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => { setError(null); setStep('photos'); }} className="px-6 py-3 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2">
                Next: Photos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 'photos' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-extrabold text-[#171717]">Property Photos</h2>
            <p className="text-sm text-slate-500">Upload at least 3 photos of your property (max 10)</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {photoPreviews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={preview} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < 10 && (
                <button onClick={() => photoInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-[#312E81] flex flex-col items-center justify-center gap-2 transition-colors">
                  <Camera className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-semibold">Add Photo</span>
                </button>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files)} />

            <div className="flex justify-between">
              <button onClick={() => setStep('details')} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <button onClick={() => {
                setError(null); setStep('proofs');
              }} className="px-6 py-3 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2">
                Next: Business Proofs <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Business Proofs */}
        {step === 'proofs' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-extrabold text-[#171717]">Business Proofs</h2>
            <p className="text-sm text-slate-500">Upload billing receipts and business registration documents</p>

            <div className="space-y-5">
              {/* Billing Receipts */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#171717]">Billing Receipts <span className="text-slate-400 font-medium">(optional)</span></h3>
                </div>
                <p className="text-xs text-slate-500">Recent utility bills, property tax receipts, or GST invoices from the hotel&apos;s city</p>
                <div className="space-y-2">
                  {billingReceipts.map((file, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-2"><FileCheck className="w-3.5 h-3.5" />{file.name}</span>
                      <button onClick={() => setBillingReceipts(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*,application/pdf'; input.multiple = true;
                  input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, setBillingReceipts);
                  input.click();
                }} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#312E81] text-sm text-slate-500 hover:text-[#312E81] font-medium transition-all flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />Upload Receipts
                </button>
              </div>

              {/* Business Proofs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#171717]">Business Registration / Other Proofs</h3>
                </div>
                <p className="text-xs text-slate-500">Trade license, FSSAI certificate, fire safety certificate, or any official permit</p>
                <div className="space-y-2">
                  {businessProofs.map((file, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                      <span className="text-xs text-blue-700 font-medium flex items-center gap-2"><FileCheck className="w-3.5 h-3.5" />{file.name}</span>
                      <button onClick={() => setBusinessProofs(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => {
                  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*,application/pdf'; input.multiple = true;
                  input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, setBusinessProofs);
                  input.click();
                }} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#312E81] text-sm text-slate-500 hover:text-[#312E81] font-medium transition-all flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />Upload Proofs
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('photos')} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <button onClick={() => {
                setError(null); setStep('review');
              }} className="px-6 py-3 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2">
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-extrabold text-[#171717]">Review Your Listing</h2>
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
              <div className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><strong>Name:</strong> {hotelName}</p>
                  <p><strong>City:</strong> {hotelCity}</p>
                  <p><strong>Type:</strong> {hotelType || 'Not specified'}</p>
                  <p><strong>Rooms:</strong> {totalRooms || 'Not specified'}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Photos ({photos.length})</h3>
                <div className="flex gap-2 overflow-x-auto">
                  {photoPreviews.slice(0, 5).map((p, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {photos.length > 5 && <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">+{photos.length - 5}</div>}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Documents</h3>
                <p className="text-xs text-slate-600">Billing Receipts: {billingReceipts.length}, Business Proofs: {businessProofs.length}</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep('proofs')} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-3 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
                {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>) : (<><ShieldCheck className="w-4 h-4" />Submit Listing</>)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
