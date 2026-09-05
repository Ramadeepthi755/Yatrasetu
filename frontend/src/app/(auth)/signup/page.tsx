'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  Briefcase,
  Check,
  Globe,
  Mountain,
  Building2,
  Utensils,
  Camera,
  History,
  Landmark,
  ShieldCheck,
  Sparkles,
  Bed,
  Car,
  Palmtree,
  Waves,
  FileText,
  CheckCircle2,
} from 'lucide-react';

type SelectedRole = 'TRAVELER' | 'PARTNER' | 'GOVERNMENT';
type Step = 1 | 2;

// Traveler options
const TRAVEL_INTERESTS = [
  { id: 'Heritage', label: 'Heritage & Monuments', desc: 'UNESCO sites, forts & palaces', icon: Building2 },
  { id: 'Nature', label: 'Nature & Wildlife', desc: 'Forests, hills, rivers & safaris', icon: Mountain },
  { id: 'Spiritual', label: 'Spiritual & Sacred', desc: 'Temples, ghats & sacred circuits', icon: Landmark },
  { id: 'Culinary', label: 'Food & Culinary Trails', desc: 'Regional cuisine & street food', icon: Utensils },
  { id: 'Adventure', label: 'Adventure & Trekking', desc: 'Hiking, rafting & outdoor sports', icon: Compass },
  { id: 'Coastal', label: 'Beaches & Backwaters', desc: 'Sunsets, coastlines & boat rides', icon: Waves },
  { id: 'Culture', label: 'Art, Craft & Culture', desc: 'Folk arts, handlooms & festivals', icon: History },
  { id: 'Photography', label: 'Travel Photography', desc: 'Scenic landscapes & historic spots', icon: Camera },
];

const TRAVEL_STYLES = [
  { id: 'Solo Explorer', label: 'Solo Explorer', desc: 'Self-paced journeys on my own schedule' },
  { id: 'Comfortable Explorer', label: 'Comfortable Explorer', desc: 'Balanced itineraries & verified stays' },
  { id: 'Backpacker / Budget', label: 'Backpacker / Budget', desc: 'Authentic local stays & hostels' },
  { id: 'Luxury & Heritage', label: 'Luxury & Heritage', desc: 'Premium palace stays & curated tours' },
  { id: 'Family & Group', label: 'Family & Group', desc: 'Relaxed, child-friendly & safe travel' },
];

const BUDGET_PREFERENCES = [
  { id: 'Budget', label: 'Budget (₹1,000–₹2,500/day)', desc: 'Hostels, public transport & local eateries' },
  { id: 'Mid-Range', label: 'Mid-Range (₹2,500–₹6,000/day)', desc: 'Comfortable hotels, cabs & guided walks' },
  { id: 'Luxury', label: 'Luxury (₹6,000+/day)', desc: 'Heritage resorts, private transport & VIP access' },
];

const TRIP_TYPES = [
  'Weekend Getaways',
  'Cultural Immersions',
  'Himalayan Treks',
  'Spiritual Circuits',
  'Wildlife Safaris',
  'Coastal Relaxation',
  'Offbeat Rural Tourism',
];

const MAJOR_INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese',
  'French', 'Spanish', 'German',
];

// Partner options
interface PartnerTypeOption {
  id: string;
  subtype: 'GUIDE' | 'HOMESTAY' | 'HOTEL' | 'RESTAURANT' | 'OTHER' | 'EXPERIENCE_PROVIDER' | 'LOCAL_HOST';
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PARTNER_TYPES: PartnerTypeOption[] = [
  {
    id: 'guide',
    subtype: 'GUIDE',
    label: 'Local Guide & Storyteller',
    desc: 'Conduct heritage walks, monument tours & storytelling',
    icon: Compass,
  },
  {
    id: 'homestay',
    subtype: 'HOMESTAY',
    label: 'Homestay / Heritage Stay',
    desc: 'Offer authentic village stays and heritage rooms',
    icon: Bed,
  },
  {
    id: 'hotel',
    subtype: 'HOTEL',
    label: 'Hotel / Resort',
    desc: 'Accommodations, boutique stays and lodge services',
    icon: Building2,
  },
  {
    id: 'restaurant',
    subtype: 'RESTAURANT',
    label: 'Restaurant / Culinary Host',
    desc: 'Traditional thalis, regional eateries & food tasting',
    icon: Utensils,
  },
  {
    id: 'agency',
    subtype: 'OTHER',
    label: 'Travel Agency / Tour Operator',
    desc: 'Curated holiday packages & local logistics',
    icon: Briefcase,
  },
  {
    id: 'transport',
    subtype: 'OTHER',
    label: 'Transport Provider',
    desc: 'Local taxis, airport transfers & inter-city cabs',
    icon: Car,
  },
  {
    id: 'rental',
    subtype: 'OTHER',
    label: 'Rental Provider',
    desc: 'Bicycle, scooter, trekking gear & camera rentals',
    icon: Palmtree,
  },
  {
    id: 'experience',
    subtype: 'EXPERIENCE_PROVIDER',
    label: 'Experience & Workshop Host',
    desc: 'Pottery, cooking classes, yoga & artisan crafts',
    icon: Sparkles,
  },
];

function ProgressBar({ step, role }: { step: Step; role: SelectedRole }) {
  if (role === 'GOVERNMENT') return null;

  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((s) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-2 ${s <= step ? 'text-[#312E81]' : 'text-slate-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              s < step
                ? 'bg-[#312E81] border-[#312E81] text-white'
                : s === step
                ? 'border-[#312E81] text-[#312E81] bg-white'
                : 'border-slate-300 text-slate-400 bg-white'
            }`}>
              {s < step ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            <span className="text-xs font-semibold hidden sm:inline">
              {s === 1 ? 'Account Credentials' : role === 'PARTNER' ? 'Partner Business Profile' : 'Traveler Preferences'}
            </span>
          </div>
          {s < 2 && (
            <div className={`flex-1 h-0.5 rounded-full transition-all ${s < step ? 'bg-[#312E81]' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ToggleChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        selected
          ? 'bg-[#312E81] text-white border-[#312E81] shadow-sm'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signup, updateTravelerProfile, updatePartner, loginAsDemo } = useAuth();
  const [role, setRole] = useState<SelectedRole>('TRAVELER');
  const [step, setStep] = useState<Step>(1);

  // Common Account Details (Step 1)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Traveler Profile State (Step 2)
  const [travelerState, setTravelerState] = useState('');
  const [travelerCity, setTravelerCity] = useState('');
  const [travelerLanguages, setTravelerLanguages] = useState<string[]>(['English', 'Hindi']);
  const [travelerInterests, setTravelerInterests] = useState<string[]>(['Heritage', 'Nature']);
  const [travelerStyle, setTravelerStyle] = useState<string>('Comfortable Explorer');
  const [budgetPreference, setBudgetPreference] = useState<string>('Mid-Range');
  const [preferredTripTypes, setPreferredTripTypes] = useState<string[]>(['Cultural Immersions', 'Weekend Getaways']);

  // Partner Profile State (Step 2)
  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerTypeOption>(PARTNER_TYPES[0]);
  const [businessName, setBusinessName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [operatingState, setOperatingState] = useState('');
  const [operatingCity, setOperatingCity] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [partnerLanguages, setPartnerLanguages] = useState<string[]>(['English', 'Hindi']);
  const [serviceCategories, setServiceCategories] = useState('');
  const [pricingInfo, setPricingInfo] = useState('');

  // Government Inquirer State
  const [govOfficerName, setGovOfficerName] = useState('');
  const [govEmail, setGovEmail] = useState('');
  const [govPhone, setGovPhone] = useState('');
  const [govDesignation, setGovDesignation] = useState('');
  const [govDepartment, setGovDepartment] = useState('');
  const [govMinistry, setGovMinistry] = useState('State Tourism Department');
  const [govState, setGovState] = useState('');
  const [govDistrict, setGovDistrict] = useState('');
  const [govOffice, setGovOffice] = useState('');
  const [govSubmitted, setGovSubmitted] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!phone.trim()) return 'Please enter your mobile number.';
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10) {
      return 'Please enter a valid 10-digit mobile number.';
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Registration for Traveler
  const handleTravelerRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await signup(fullName.trim(), email.trim(), password, 'TRAVELER');
      
      // Save traveler profile preferences
      try {
        await updateTravelerProfile({
          state: travelerState || undefined,
          city: travelerCity || undefined,
          languages: travelerLanguages,
          interests: travelerInterests,
          travelStyle: travelerStyle,
          budgetPreference: budgetPreference,
        });
      } catch (profileErr) {
        console.warn('Profile preference update handled non-blockingly:', profileErr);
      }

      router.push('/explore');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete traveler registration.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Final Registration for Local Partner
  const handlePartnerRegister = async () => {
    if (!businessName.trim()) {
      setError('Please provide your business or service name.');
      return;
    }
    if (!operatingCity.trim()) {
      setError('Please provide your primary operating city.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signup(
        fullName.trim(),
        email.trim(),
        password,
        'PARTNER',
        selectedPartnerType.subtype
      );

      // Save partner profile details
      try {
        const skillsList = serviceCategories
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        await updatePartner({
          businessName: businessName.trim(),
          partnerSubtype: selectedPartnerType.subtype,
          state: operatingState.trim() || undefined,
          city: operatingCity.trim(),
          bio: serviceDescription.trim() || undefined,
          partnerSkills: skillsList.length > 0 ? skillsList : [selectedPartnerType.label],
          languages: partnerLanguages,
        });
      } catch (partnerErr) {
        console.warn('Partner profile details saved non-blockingly:', partnerErr);
      }

      router.push('/partner/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete partner registration.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGovRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!govOfficerName.trim() || !govEmail.trim() || !govDesignation.trim()) {
      setError('Please complete all required government officer details.');
      return;
    }
    if (!govEmail.toLowerCase().includes('gov') && !govEmail.toLowerCase().includes('nic')) {
      setError('Official email must be from a verified government domain (e.g. @gov.in, @nic.in, or state department).');
      return;
    }
    setError(null);
    setGovSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FFFBF5]">
      {/* Left visual brand panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/3 relative bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F766E] overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#0F766E]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-[#312E81]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">YatraSetu</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#F59E0B]">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Tourism Network
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Connecting India&apos;s<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">travelers, partners</span><br />
            & governance.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Personalized itineraries for travelers, transparent listings for local tourism partners, and real-time intelligence for state authorities.
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              { icon: Compass, text: 'Personalized destination and POI matching' },
              { icon: Briefcase, text: 'Direct partner listing with verified credentials' },
              { icon: Landmark, text: 'Government data honesty & zero-hallucination policy' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-[#F59E0B]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#F59E0B] font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>

      {/* Right Content Form Panel */}
      <div className="flex-1 flex items-start justify-center py-10 px-4 sm:px-6 lg:px-10 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <span className="text-lg font-bold text-[#312E81]">YatraSetu</span>
          </div>

          <ProgressBar step={step} role={role} />

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ROLE SELECTION & STEP 1: ACCOUNT DETAILS                                   */}
          {/* ========================================================================= */}
          {step === 1 && role !== 'GOVERNMENT' && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Create your account</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Select how you want to use YatraSetu and enter your credentials.
                </p>
              </div>

              {/* Role Selection Options */}
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2.5">
                  How do you want to use YatraSetu? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Traveler */}
                  <button
                    type="button"
                    onClick={() => { setRole('TRAVELER'); setError(null); }}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                      role === 'TRAVELER'
                        ? 'border-[#312E81] ring-2 ring-[#312E81]/20 bg-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#312E81] flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#171717]">Traveler</div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                        Explore India, plan trips, connect with locals and travel communities.
                      </p>
                    </div>
                    {role === 'TRAVELER' && (
                      <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#312E81] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Option 2: Local Partner */}
                  <button
                    type="button"
                    onClick={() => { setRole('PARTNER'); setError(null); }}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                      role === 'PARTNER'
                        ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 bg-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#171717]">Local Partner</div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                        Offer authentic local experiences, stays and tourism services.
                      </p>
                    </div>
                    {role === 'PARTNER' && (
                      <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#0F766E] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Government Access Disclaimer / Gateway */}
                <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-950">Government Authority Access</span>
                      <p className="text-[11px] text-amber-800">Authorized access for Ministry & State Tourism official accounts.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setRole('GOVERNMENT'); setError(null); }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors whitespace-nowrap shadow-sm"
                  >
                    Official Portal →
                  </button>
                </div>
              </div>

              {/* Account Credentials Fields */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={role === 'PARTNER' ? 'e.g. Rajesh Kumar (Host/Guide)' : 'e.g. Aditi Sharma'}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Password (min. 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 w-8 rounded-full transition-colors ${
                            password.length >= i * 3
                              ? password.length >= 10
                                ? 'bg-emerald-500'
                                : password.length >= 6
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {password.length >= 10 ? 'Strong' : password.length >= 6 ? 'Good' : 'Too short'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 group ${
                  role === 'PARTNER' ? 'bg-[#0F766E] hover:bg-[#0D9488]' : 'bg-[#312E81] hover:bg-[#1E1B4B]'
                }`}
              >
                <span>Continue to {role === 'PARTNER' ? 'Partner Business Profile' : 'Traveler Profile'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <p className="text-center text-xs text-[#64748B]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#312E81] font-semibold hover:text-[#F59E0B] transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: TRAVELER ONBOARDING (Clean, Non-Business)                         */}
          {/* ========================================================================= */}
          {step === 2 && role === 'TRAVELER' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Traveler Profile & Preferences</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Help YatraSetu tailor your personalized recommendations, AI itineraries, and community connections.
                </p>
              </div>

              {/* Location: Home State & City */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Where is your home base?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={travelerState}
                      onChange={(e) => setTravelerState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none shadow-sm"
                    >
                      <option value="">Select Home State</option>
                      {MAJOR_INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={travelerCity}
                      onChange={(e) => setTravelerCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Pune, Delhi"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Interests */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center justify-between">
                  <span>Travel Interests</span>
                  <span className="text-[11px] font-normal text-slate-500 lowercase">(select all that match)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TRAVEL_INTERESTS.map((item) => {
                    const isSelected = travelerInterests.includes(item.id);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleArrayItem(travelerInterests, setTravelerInterests, item.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#312E81] bg-indigo-50/70 ring-1 ring-[#312E81]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-[#312E81] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-[#171717]">{item.label}</div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#312E81] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Your Preferred Travel Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelerStyle(style.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        travelerStyle === style.id
                          ? 'border-[#312E81] bg-indigo-50/70 ring-1 ring-[#312E81]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#171717]">{style.label}</div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Preference */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Budget Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {BUDGET_PREFERENCES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudgetPreference(b.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        budgetPreference === b.id
                          ? 'border-[#F59E0B] bg-amber-50 ring-1 ring-[#F59E0B]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#171717]">{b.id}</div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{b.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Trip Types */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Preferred Trip Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRIP_TYPES.map((type) => (
                    <ToggleChip
                      key={type}
                      selected={preferredTripTypes.includes(type)}
                      onClick={() => toggleArrayItem(preferredTripTypes, setPreferredTripTypes, type)}
                    >
                      {type}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Preferred Languages */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Languages You Speak
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <ToggleChip
                      key={lang}
                      selected={travelerLanguages.includes(lang)}
                      onClick={() => toggleArrayItem(travelerLanguages, setTravelerLanguages, lang)}
                    >
                      {lang}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); window.scrollTo({ top: 0 }); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleTravelerRegister}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-bold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Signup & Start Exploring
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: LOCAL PARTNER ONBOARDING (Role-Specific Business Details)          */}
          {/* ========================================================================= */}
          {step === 2 && role === 'PARTNER' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Local Partner Onboarding</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  List your tourism service, verified expertise, or local experience on the YatraSetu ecosystem.
                </p>
              </div>

              {/* Partner Type Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                  Partner Service Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PARTNER_TYPES.map((type) => {
                    const isSelected = selectedPartnerType.id === type.id;
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedPartnerType(type)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-[#0F766E] bg-teal-50/70 ring-1 ring-[#0F766E]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-[#171717]">{type.label}</div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{type.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0F766E] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Business Name & Address */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Business / Service Name *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Hampi Heritage Walks & Guided Excursions"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Operating State *
                    </label>
                    <select
                      value={operatingState}
                      onChange={(e) => setOperatingState(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none shadow-sm"
                    >
                      <option value="">Select State</option>
                      {MAJOR_INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Primary Operating City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={operatingCity}
                        onChange={(e) => setOperatingCity(e.target.value)}
                        placeholder="e.g. Hampi, Kochi, Jaipur"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Full Business / Meeting Address
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g. Near Virupaksha Temple Complex, Hampi Bazaar"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Service Description & Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="Describe your tours, stays, vehicle fleet, or culinary specialities for travelers..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none resize-none shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Skills & Specializations
                    </label>
                    <input
                      type="text"
                      value={serviceCategories}
                      onChange={(e) => setServiceCategories(e.target.value)}
                      placeholder="e.g. Temple Architecture, Storytelling, Trekking"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                      Indicative Rates / Pricing (INR)
                    </label>
                    <input
                      type="text"
                      value={pricingInfo}
                      onChange={(e) => setPricingInfo(e.target.value)}
                      placeholder="e.g. ₹500/hr or ₹1,200/person"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
                    Languages for Customer Communication
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <ToggleChip
                        key={lang}
                        selected={partnerLanguages.includes(lang)}
                        onClick={() => toggleArrayItem(partnerLanguages, setPartnerLanguages, lang)}
                      >
                        {lang}
                      </ToggleChip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Partner Verification Lifecycle Notice */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#0F766E]">
                  <ShieldCheck className="w-4 h-4" />
                  Partner Verification Lifecycle
                </div>
                <div className="flex items-center gap-2 text-[11px] text-teal-800 font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-white border border-teal-300">1. Registered</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-teal-300">2. Review</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold">3. Verified Partner</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Upon registration, your account receives a <strong>Partner Listing</strong> status. Once contact details and credentials are authenticated, your account will display the official <strong>Verified Partner</strong> badge.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); window.scrollTo({ top: 0 }); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePartnerRegister}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0F766E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering Partner...
                    </>
                  ) : (
                    <>
                      Register & Open Partner Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GOVERNMENT AUTHORITY ACCESS WORKFLOW (Server-Authorized / Official Flow)  */}
          {/* ========================================================================= */}
          {role === 'GOVERNMENT' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
                    <Landmark className="w-3.5 h-3.5 text-amber-700" />
                    Government Authority Portal
                  </div>
                  <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Authorized Official Access</h1>
                </div>
                <button
                  type="button"
                  onClick={() => { setRole('TRAVELER'); setError(null); }}
                  className="text-xs font-semibold text-[#312E81] hover:underline"
                >
                  ← Return to Public Signup
                </button>
              </div>

              {/* Security & Authorization Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Official Credential Policy
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Government intelligence dashboards and tourism redistribution controls are restricted to authenticated Ministry of Tourism and State Tourism Department officials. Public self-signup is strictly disabled for government authority accounts to prevent unauthorized access.
                </p>
              </div>

              {govSubmitted ? (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#171717]">Authority Verification Request Submitted</h3>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Your verification request for <strong>{govEmail}</strong> has been logged. YatraSetu administration will authenticate your official department credentials and issue your secure access token.
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => loginAsDemo('GOVERNMENT').then(() => router.push('/government/dashboard'))}
                      className="px-4 py-2.5 bg-[#312E81] text-white text-xs font-bold rounded-xl shadow hover:bg-[#1E1B4B] transition-colors"
                    >
                      Explore Government Demo Dashboard
                    </button>
                    <Link
                      href="/login"
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGovRequestSubmit} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                  <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                    Submit Authority Credential Verification Request
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">Officer Name *</label>
                      <input
                        type="text"
                        required
                        value={govOfficerName}
                        onChange={(e) => setGovOfficerName(e.target.value)}
                        placeholder="e.g. Dr. A. K. Sharma"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">Official Email (@gov.in / @nic.in) *</label>
                      <input
                        type="email"
                        required
                        value={govEmail}
                        onChange={(e) => setGovEmail(e.target.value)}
                        placeholder="officer@tourism.gov.in"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">Designation / Title *</label>
                      <input
                        type="text"
                        required
                        value={govDesignation}
                        onChange={(e) => setGovDesignation(e.target.value)}
                        placeholder="e.g. Director General / Tourism Secretary"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">Official Mobile Number</label>
                      <input
                        type="tel"
                        value={govPhone}
                        onChange={(e) => setGovPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">Ministry / Department</label>
                      <input
                        type="text"
                        value={govMinistry}
                        onChange={(e) => setGovMinistry(e.target.value)}
                        placeholder="e.g. Ministry of Tourism, Govt of India"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#171717] mb-1">State / UT Jurisdiction</label>
                      <select
                        value={govState}
                        onChange={(e) => setGovState(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#171717] focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none"
                      >
                        <option value="">National / All India</option>
                        {MAJOR_INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Submit Official Credential Verification Request
                  </button>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Need to preview the intelligence system?</span>
                    <button
                      type="button"
                      onClick={() => loginAsDemo('GOVERNMENT').then(() => router.push('/government/dashboard'))}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      Try Official Demo Login →
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
