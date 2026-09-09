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
} from 'lucide-react';

type Role = 'TRAVELER' | 'PARTNER';
type Step = 1 | 2;

// Tourist preference questions
const SOCIAL_STYLES = [
  { id: 'introvert', label: 'Introvert', desc: 'I prefer quiet, personal discoveries', icon: '≡ƒºÿ' },
  { id: 'ambivert', label: 'Ambivert', desc: 'Depends on my mood and company', icon: 'ΓÜû∩╕Å' },
  { id: 'extrovert', label: 'Extrovert', desc: 'I love meeting people while travelling', icon: '≡ƒñ¥' },
];

const GROUP_STYLES = [
  { id: 'solo', label: 'Solo Explorer', desc: 'I travel alone, on my own schedule', icon: '≡ƒº│' },
  { id: 'duo', label: 'Duo / Couple', desc: 'Best experiences with one companion', icon: '≡ƒæ½' },
  { id: 'group', label: 'Group Traveler', desc: 'More the merrier & safer too', icon: '≡ƒæÑ' },
  { id: 'family', label: 'Family Trips', desc: 'With kids or extended family', icon: '≡ƒæ¿ΓÇì≡ƒæ⌐ΓÇì≡ƒæºΓÇì≡ƒæª' },
];

const FOOD_PREFS = [
  { id: 'veg', label: 'Vegetarian', icon: '≡ƒÑù' },
  { id: 'nonveg', label: 'Non-Vegetarian', icon: '≡ƒìù' },
  { id: 'vegan', label: 'Vegan', icon: '≡ƒî▒' },
  { id: 'street', label: 'Street Food Lover', icon: '≡ƒî«' },
  { id: 'regional', label: 'Regional Cuisine', icon: '≡ƒì¢' },
  { id: 'seafood', label: 'Seafood', icon: '≡ƒªÉ' },
];

const PLACE_TYPES = [
  { id: 'historical', label: 'Historical', desc: 'Monuments, ruins & ancient sites', icon: History },
  { id: 'heritage', label: 'Heritage', desc: 'UNESCO sites, palaces & traditions', icon: Building2 },
  { id: 'adventure', label: 'Adventurous', desc: 'Trekking, rafting & outdoor sports', icon: Mountain },
  { id: 'nature', label: 'Nature & Wildlife', desc: 'Forests, hills, rivers & wildlife', icon: '≡ƒî┐' },
  { id: 'coastal', label: 'Beaches & Coastal', desc: 'Beaches, backwaters & sunsets', icon: '≡ƒÅû∩╕Å' },
  { id: 'spiritual', label: 'Spiritual & Sacred', desc: 'Temples, ghats & sacred circuits', icon: '≡ƒ¢ò' },
  { id: 'urban', label: 'Urban Culture', desc: 'Cities, art & local neighbourhoods', icon: '≡ƒÅÖ∩╕Å' },
  { id: 'culinary', label: 'Food Trails', desc: 'Culinary journeys & food markets', icon: Utensils },
];

const GUIDE_PREF = [
  { id: 'always', label: 'Guide Every Trip', desc: 'I prefer local expertise for all destinations', icon: '≡ƒù║∩╕Å' },
  { id: 'specific', label: 'Specific Cities Only', desc: 'Only for unfamiliar or complex locations', icon: '≡ƒôì' },
  { id: 'never', label: 'Self-Explorer', desc: 'I rely on apps and my own research', icon: '≡ƒö¡' },
];

const MOST_VISITED_REGIONS = [
  'North India', 'South India', 'East India', 'West India',
  'Northeast India', 'Central India', 'Himalayas', 'Coastal India',
];

// Guide-specific data
const LANGUAGES = [
  'English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam',
  'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese',
  'French', 'Spanish', 'German', 'Japanese',
];

const GUIDE_SUBTYPES = [
  { id: 'GUIDE', label: 'Local Guide / Storyteller', icon: '≡ƒº¡' },
  { id: 'LOCAL_HOST', label: 'Community Host / Cultural Expert', icon: '≡ƒÅí' },
  { id: 'EXPERIENCE_PROVIDER', label: 'Experience / Activity Provider', icon: '≡ƒÄ»' },
  { id: 'HOMESTAY', label: 'Homestay / Heritage Stay', icon: '≡ƒ¢û' },
  { id: 'RESTAURANT', label: 'Local Cuisine / Culinary Host', icon: '≡ƒì╜∩╕Å' },
  { id: 'ARTISAN', label: 'Artisan / Handloom Creator', icon: '≡ƒº╡' },
  { id: 'PHOTOGRAPHER', label: 'Travel Photographer', icon: '≡ƒô╕' },
];

const INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata',
  'Jaipur', 'Udaipur', 'Varanasi', 'Agra', 'Hampi', 'Mysuru',
  'Kochi', 'Goa', 'Rishikesh', 'Leh', 'Darjeeling', 'Amritsar',
  'Ahmedabad', 'Bhopal', 'Puri', 'Madurai', 'Pondicherry', 'Shimla',
];

function ProgressBar({ step }: { step: Step }) {
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
              {s === 1 ? 'Your Details' : 'Complete Profile'}
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
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
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
  const { signup } = useAuth();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('TRAVELER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 tourist state
  const [socialStyle, setSocialStyle] = useState<string>('ambivert');
  const [groupStyle, setGroupStyle] = useState<string>('solo');
  const [foodPrefs, setFoodPrefs] = useState<string[]>(['veg', 'street']);
  const [placeTypes, setPlaceTypes] = useState<string[]>(['historical', 'heritage']);
  const [guidePref, setGuidePref] = useState<string>('specific');
  const [visitedRegions, setVisitedRegions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);

  // Step 2 guide state
  const [guideSubtype, setGuideSubtype] = useState('GUIDE');
  const [businessName, setBusinessName] = useState('');
  const [guideCity, setGuideCity] = useState('');
  const [guideState, setGuideState] = useState('');
  const [bio, setBio] = useState('');
  const [guideLanguages, setGuideLanguages] = useState<string[]>(['English', 'Hindi']);
  const [knownCities, setKnownCities] = useState<string[]>([]);
  const [skills, setSkills] = useState('');

  const toggleArr = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email address.';
    if (!phone.trim()) return 'Please enter your phone number.';
    if (!password || password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await signup(fullName, email, password, role, role === 'PARTNER' ? guideSubtype : undefined);
      if (role === 'PARTNER') {
        router.push('/onboarding/partner');
      } else {
        router.push('/onboarding/traveler');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/3 relative bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F766E] overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[#0F766E]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-[#312E81]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">YatraSetu</span>
        </div>

        <div className="relative z-10 space-y-5">
          <p className="text-[#F59E0B] text-xs font-bold uppercase tracking-widest">Join the family</p>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            India&apos;s largest<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">community</span><br/>
            of travelers<br/>
            & storytellers.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Whether you explore or guide, YatraSetu builds your perfect journey profile so every recommendation matters.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { icon: '≡ƒº¡', text: 'Personalised destination matching' },
              { icon: '≡ƒñ¥', text: 'Connect with verified local guides' },
              { icon: '≡ƒù║∩╕Å', text: 'AI trip planner tuned to your style' },
              { icon: '≡ƒôè', text: 'Contribute to India\'s tourism intelligence' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="text-base">{icon}</span>
                {text}
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

      {/* Right panel ΓÇö form */}
      <div className="flex-1 flex items-start justify-center py-10 px-4 sm:px-6 lg:px-10 bg-[#FFFBF5] overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <span className="text-lg font-bold text-[#312E81]">YatraSetu</span>
          </div>

          <ProgressBar step={step} />

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ΓöÇΓöÇΓöÇΓöÇ STEP 1 ΓöÇΓöÇΓöÇΓöÇ */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Create your account</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Let&apos;s start with your basic details.
                </p>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-2">
                  I want to join as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      r: 'TRAVELER' as Role,
                      label: 'Tourist',
                      desc: 'Explore India, plan trips & discover local culture',
                      icon: Users,
                      accent: '#312E81',
                      bg: 'indigo-50/60',
                      ring: 'ring-[#312E81]',
                      border: 'border-[#312E81]',
                      emoji: '≡ƒº│',
                    },
                    {
                      r: 'PARTNER' as Role,
                      label: 'Tourist Guide',
                      desc: 'Host, guide, and share your city\'s stories',
                      icon: Briefcase,
                      accent: '#0F766E',
                      bg: 'teal-50/60',
                      ring: 'ring-[#0F766E]',
                      border: 'border-[#0F766E]',
                      emoji: '≡ƒº¡',
                    },
                  ].map(({ r, label, desc, emoji, ring, border }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-2 ${
                        role === r
                          ? `${border} ${ring} ring-2 bg-white shadow-sm`
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <div className="text-sm font-bold text-[#171717]">{label}</div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{desc}</p>
                      </div>
                      {role === r && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#312E81] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
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
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Address / Home City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 12 MG Road, Bengaluru, Karnataka"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
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
                    Phone Number *
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

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  Password (min. 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 w-8 rounded-full transition-colors ${
                          password.length >= i * 3
                            ? password.length >= 10 ? 'bg-emerald-500' : password.length >= 6 ? 'bg-amber-400' : 'bg-rose-400'
                            : 'bg-slate-200'
                        }`} />
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
                className="w-full py-3.5 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 group"
              >
                Continue ΓÇö Set Up Profile
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

          {/* ΓöÇΓöÇΓöÇΓöÇ STEP 2: TOURIST ΓöÇΓöÇΓöÇΓöÇ */}
          {step === 2 && role === 'TRAVELER' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Your Travel Personality</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Help us tailor every recommendation, guide match, and AI itinerary to your style.
                </p>
              </div>

              {/* Q1: Social style */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">1</span>
                  Are you more of an introvert or extrovert?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {SOCIAL_STYLES.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSocialStyle(opt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        socialStyle === opt.id
                          ? 'border-[#312E81] bg-indigo-50 ring-1 ring-[#312E81]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg block mb-1">{opt.icon}</span>
                      <div className="text-xs font-bold text-[#171717]">{opt.label}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug hidden sm:block">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2: Group style */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">2</span>
                  Do you prefer solo trips or group travel?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GROUP_STYLES.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGroupStyle(opt.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        groupStyle === opt.id
                          ? 'border-[#312E81] bg-indigo-50 ring-1 ring-[#312E81]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl block mb-1.5">{opt.icon}</span>
                      <div className="text-[11px] font-bold text-[#171717]">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3: Food */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">3</span>
                  What food do you enjoy? <span className="text-[11px] font-normal text-slate-500">(Select all that apply)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {FOOD_PREFS.map((opt) => (
                    <ToggleChip
                      key={opt.id}
                      selected={foodPrefs.includes(opt.id)}
                      onClick={() => toggleArr(foodPrefs, setFoodPrefs, opt.id)}
                    >
                      {opt.icon} {opt.label}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Q4: Places */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">4</span>
                  What kind of places do you love visiting?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PLACE_TYPES.map((opt) => {
                    const isSelected = placeTypes.includes(opt.id);
                    const IconEl = typeof opt.icon === 'string' ? null : opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleArr(placeTypes, setPlaceTypes, opt.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#312E81] bg-indigo-50 ring-1 ring-[#312E81]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-base">
                            {typeof opt.icon === 'string' ? opt.icon : IconEl && <IconEl className="w-4 h-4 text-[#312E81]" />}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#312E81]" />}
                        </div>
                        <div className="text-[11px] font-bold text-[#171717]">{opt.label}</div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug hidden sm:block">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Q5: Guide preference */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">5</span>
                  Do you like having a guide for your trips?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {GUIDE_PREF.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGuidePref(opt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        guidePref === opt.id
                          ? 'border-[#F59E0B] bg-amber-50 ring-1 ring-[#F59E0B]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg block mb-1">{opt.icon}</span>
                      <div className="text-[11px] font-bold text-[#171717]">{opt.label}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug hidden sm:block">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q6: Regions visited */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">6</span>
                  Which regions of India have you visited most?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {MOST_VISITED_REGIONS.map((region) => (
                    <ToggleChip
                      key={region}
                      selected={visitedRegions.includes(region)}
                      onClick={() => toggleArr(visitedRegions, setVisitedRegions, region)}
                    >
                      {region}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Q7: Languages */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#312E81] text-white text-xs flex items-center justify-center font-semibold">7</span>
                  Languages you speak or understand
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.slice(0, 12).map((lang) => (
                    <ToggleChip
                      key={lang}
                      selected={languages.includes(lang)}
                      onClick={() => toggleArr(languages, setLanguages, lang)}
                    >
                      {lang}
                    </ToggleChip>
                  ))}
                </div>
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
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#171717] font-bold rounded-xl text-sm shadow-md shadow-[#F59E0B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account & Start Exploring
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ΓöÇΓöÇΓöÇΓöÇ STEP 2: GUIDE ΓöÇΓöÇΓöÇΓöÇ */}
          {step === 2 && role === 'PARTNER' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">Your Guide Profile</h1>
                <p className="text-sm text-[#64748B] mt-1">
                  Tell travelers about your experience, cities you know, and how you can guide them.
                </p>
              </div>

              {/* Guide subtype */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  I am a... *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GUIDE_SUBTYPES.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGuideSubtype(opt.id)}
                      className={`p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                        guideSubtype === opt.id
                          ? 'border-[#0F766E] bg-teal-50 ring-1 ring-[#0F766E]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-xs font-bold text-[#171717]">{opt.label}</span>
                      {guideSubtype === opt.id && <Check className="w-4 h-4 text-[#0F766E] ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business name + cities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Business / Guide Name *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Ramesh Heritage Walks"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717]  placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                    />
                  </div>
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
                      value={guideCity}
                      onChange={(e) => setGuideCity(e.target.value)}
                      placeholder="e.g. Hampi, Kochi"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={guideState}
                    onChange={(e) => setGuideState(e.target.value)}
                    placeholder="e.g. Karnataka, Kerala"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Cities you know */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  Cities You Know Well
                  <span className="ml-1.5 text-[10px] font-normal text-slate-500 normal-case">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_CITIES.map((city) => (
                    <ToggleChip
                      key={city}
                      selected={knownCities.includes(city)}
                      onClick={() => toggleArr(knownCities, setKnownCities, city)}
                    >
                      {city}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#0F766E]" />
                  Languages You Guide In *
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <ToggleChip
                      key={lang}
                      selected={guideLanguages.includes(lang)}
                      onClick={() => toggleArr(guideLanguages, setGuideLanguages, lang)}
                    >
                      {lang}
                    </ToggleChip>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  Key Skills & Specialisations
                  <span className="ml-1.5 text-[10px] font-normal text-slate-500 normal-case">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Temple Architecture, Photography, Birdwatching, Local Cuisine"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none transition-all shadow-sm"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  About You & Your Services
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell travelers what makes your local expertise unique ΓÇö your background, highlight tours, and what travelers say about you..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 outline-none resize-none transition-all shadow-sm"
                />
              </div>

              {/* Verification note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Verification note:</strong> Your guide profile will be reviewed by regional tourism authorities. Once approved, you&apos;ll receive a verified badge and appear in traveler searches.
              </div>

              {/* Actions */}
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
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0F766E]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Submit Profile & Open Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
