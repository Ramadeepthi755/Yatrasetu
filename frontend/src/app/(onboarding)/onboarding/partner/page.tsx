'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Compass,
} from 'lucide-react';

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const { user, role, isAuthenticated, partnerDetails, updatePartner, logout, openAuthModal } = useAuth();

  const [businessName, setBusinessName] = useState(partnerDetails?.businessName || '');
  const [partnerSubtype, setPartnerSubtype] = useState(partnerDetails?.partnerSubtype || 'GUIDE');
  const [city, setCity] = useState(partnerDetails?.city || '');
  const [state, setState] = useState(partnerDetails?.state || '');
  const [bio, setBio] = useState(partnerDetails?.bio || '');
  const [skills, setSkills] = useState(partnerDetails?.partnerSkills?.join(', ') || 'Storytelling, Heritage Tours');
  const [languages, setLanguages] = useState(partnerDetails?.languages?.join(', ') || 'English, Hindi');
  const [saving, setSaving] = useState(false);

  // Sync state if partnerDetails change
  useEffect(() => {
    if (partnerDetails) {
      if (partnerDetails.businessName) setBusinessName(partnerDetails.businessName);
      if (partnerDetails.partnerSubtype) setPartnerSubtype(partnerDetails.partnerSubtype);
      if (partnerDetails.city) setCity(partnerDetails.city);
      if (partnerDetails.state) setState(partnerDetails.state);
      if (partnerDetails.bio) setBio(partnerDetails.bio);
      if (partnerDetails.partnerSkills && partnerDetails.partnerSkills.length > 0) {
        setSkills(partnerDetails.partnerSkills.join(', '));
      }
      if (partnerDetails.languages && partnerDetails.languages.length > 0) {
        setLanguages(partnerDetails.languages.join(', '));
      }
    }
  }, [partnerDetails]);

  // GUARD 1: Unauthenticated Guest
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto shadow-sm">
            <Briefcase className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-[#171717]">Partner Sign In Required</h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Local Tourism Partner Onboarding is reserved for registered tourism operators, local guides, community hosts, and homestay owners.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => openAuthModal('PARTNER')}
              className="w-full py-3 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Sign In as Local Partner
            </button>
            <Link
              href="/explore"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return to Public Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // GUARD 2: Authenticated as non-partner (e.g. Traveler or Government)
  if (role !== 'PARTNER') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-amber-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-[#171717]">Access Restricted</h2>
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              Signed In: {user?.fullName || 'Traveler'}
            </div>
            <div>Current Account Role: <strong>{role || 'TRAVELER'}</strong></div>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Partner Onboarding and hosting tools are exclusively available to Local Partner accounts. You cannot onboard as a partner while signed in with a Traveler account.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={async () => {
                await logout();
                openAuthModal('PARTNER');
              }}
              className="w-full py-3 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Sign Out & Sign In as Partner
            </button>
            <Link
              href="/explore"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return to Public Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // VALID PARTNER ACCESS
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const langsArray = languages.split(',').map((l) => l.trim()).filter(Boolean);

      await updatePartner({
        businessName: businessName || `${user?.fullName || 'Local'}'s Tourism Services`,
        partnerSubtype: partnerSubtype as any,
        city,
        state,
        bio,
        partnerSkills: skillsArray,
        languages: langsArray,
      });

      router.push('/partner/dashboard');
    } catch (err) {
      console.error('Error saving partner profile:', err);
      router.push('/partner/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-xs font-semibold">
          <Briefcase className="w-4 h-4 text-[#0F766E]" />
          Local Tourism Partner Onboarding
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          Welcome, {user?.fullName || 'Partner'}
        </h1>
        <p className="text-sm text-[#64748B] max-w-xl mx-auto">
          Complete your tourism partner profile. Verified partners connect directly with travelers and receive booking requests.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <ShieldCheck className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <strong>Verification Protocol:</strong> Your profile will be submitted with status{' '}
            <span className="px-2 py-0.5 rounded bg-amber-200/80 font-bold text-amber-900">PENDING</span>.
            Once approved by regional authorities, your verified badge will be unlocked.
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Business / Hosting Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Ramesh Heritage Walks"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Partner Role / Subtype
              </label>
              <select
                value={partnerSubtype}
                onChange={(e) => setPartnerSubtype(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
              >
                <option value="GUIDE">Local Guide / Storyteller</option>
                <option value="LOCAL_HOST">Community Host / Cultural Custodian</option>
                <option value="EXPERIENCE_PROVIDER">Experience / Activity Host</option>
                <option value="HOMESTAY">Homestay / Heritage Stay</option>
                <option value="HOTEL">Hotel / Resort</option>
                <option value="RESTAURANT">Local Cuisine / Food Specialist</option>
                <option value="ARTISAN">Artisan / Handloom Creator</option>
                <option value="PHOTOGRAPHER">Travel Photographer</option>
                <option value="OTHER">Other Tourism Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Operating City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hampi, Kochi, Jaipur"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Karnataka, Kerala, Rajasthan"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
              About Your Services & Local Expertise
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell travelers what makes your local experience unique, your background, and highlights..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Key Skills / Offerings (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Storytelling, Temple Art, Birdwatching"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Spoken Languages (comma separated)
              </label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="Kannada, English, Hindi"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#0F766E] outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#0F766E] hover:bg-[#0D9488] text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? 'Submitting...' : 'Submit Profile & Open Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
