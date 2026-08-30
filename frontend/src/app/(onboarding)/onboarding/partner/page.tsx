'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const { user, partnerDetails, updatePartner } = useAuth();
  const [businessName, setBusinessName] = useState(partnerDetails?.businessName || '');
  const [partnerSubtype, setPartnerSubtype] = useState(partnerDetails?.partnerSubtype || 'GUIDE');
  const [city, setCity] = useState(partnerDetails?.city || '');
  const [state, setState] = useState(partnerDetails?.state || '');
  const [bio, setBio] = useState(partnerDetails?.bio || '');
  const [skills, setSkills] = useState(partnerDetails?.partnerSkills?.join(', ') || 'Storytelling, Heritage Tours');
  const [languages, setLanguages] = useState(partnerDetails?.languages?.join(', ') || 'English, Hindi');
  const [saving, setSaving] = useState(false);

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
