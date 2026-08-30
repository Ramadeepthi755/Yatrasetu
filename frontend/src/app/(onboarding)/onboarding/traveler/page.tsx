'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, Sparkles, Check, ArrowRight, SkipForward } from 'lucide-react';

const INTERESTS_OPTIONS = [
  { id: 'Nature', label: '🌿 Nature & Hills', desc: 'Mountains, forests & lakes' },
  { id: 'Food', label: '🍲 Food & Culinary', desc: 'Street food, regional thalis & spice walks' },
  { id: 'Heritage', label: '🏰 Heritage & History', desc: 'Forts, palaces & ancient monuments' },
  { id: 'Adventure', label: '🧗 Adventure', desc: 'Trekking, rafting & wild trails' },
  { id: 'Beaches', label: '🏖️ Beaches & Coastal', desc: 'Sunsets, backwaters & oceans' },
  { id: 'Culture', label: '🎭 Arts & Culture', desc: 'Folk dances, crafts & traditions' },
  { id: 'Spiritual', label: '🛕 Spiritual & Sacred', desc: 'Temples, ghats & sacred circuits' },
  { id: 'Wildlife', label: '🐅 Wildlife & Safaris', desc: 'National parks & bird reserves' },
  { id: 'Photography', label: '📸 Photography', desc: 'Golden hour spots & scenic viewpoints' },
  { id: 'Shopping', label: '🛍️ Local Bazaars', desc: 'Handlooms, spices & handicrafts' },
];

const TRAVEL_STYLES = [
  'Budget / Backpacker',
  'Comfortable Explorer',
  'Luxury & Heritage',
  'Solo Traveler',
  'Family & Relaxed',
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'French',
  'Spanish',
  'German',
];

export default function TravelerOnboardingPage() {
  const router = useRouter();
  const { user, updateTravelerProfile } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Nature', 'Heritage']);
  const [selectedStyle, setSelectedStyle] = useState<string>('Comfortable Explorer');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);
  const [budgetPref, setBudgetPref] = useState<string>('Mid-Range');
  const [homeCity, setHomeCity] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((x) => x !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTravelerProfile({
        interests: selectedInterests,
        travelStyle: selectedStyle,
        languages: selectedLanguages,
        budgetPreference: budgetPref,
        city: homeCity || undefined,
      });
      router.push('/');
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      router.push('/'); // Non-blocking: proceed even if offline
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#312E81]/10 text-[#312E81] text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          Personalize Your India Journey
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
          Welcome to YatraSetu, {user?.fullName?.split(' ')[0] || 'Traveler'} 👋
        </h1>
        <p className="text-sm text-[#64748B] max-w-xl mx-auto">
          Help our matching and AI planner recommend the most authentic destinations, local hosts, and travel companions for you.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-8">
        {/* Section 1: Interests */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#312E81] text-white flex items-center justify-center text-xs font-semibold">1</span>
            What travel experiences do you love most?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERESTS_OPTIONS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-[#312E81] bg-indigo-50/60 ring-1 ring-[#312E81]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-[#171717]">{item.label}</div>
                    <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 ${
                      isSelected ? 'bg-[#312E81] border-[#312E81] text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Travel Style & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#312E81] text-white flex items-center justify-center text-xs font-semibold">2</span>
              Preferred Travel Style
            </h2>
            <div className="space-y-2">
              {TRAVEL_STYLES.map((style) => (
                <label
                  key={style}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStyle === style
                      ? 'border-[#0F766E] bg-teal-50/50 text-[#0F766E] font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-[#171717] text-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="travelStyle"
                    value={style}
                    checked={selectedStyle === style}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="accent-[#0F766E]"
                  />
                  <span className="text-xs sm:text-sm">{style}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#312E81] text-white flex items-center justify-center text-xs font-semibold">3</span>
              Budget & Home City
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Typical Daily Budget Preference
              </label>
              <select
                value={budgetPref}
                onChange={(e) => setBudgetPref(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] outline-none focus:border-[#312E81]"
              >
                <option value="Budget">Budget (₹1,000 - ₹2,500 / day)</option>
                <option value="Mid-Range">Mid-Range (₹2,500 - ₹6,000 / day)</option>
                <option value="Luxury">Luxury (₹6,000+ / day)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Your Home City (Optional)
              </label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] outline-none focus:border-[#312E81]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Languages */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#312E81] text-white flex items-center justify-center text-xs font-semibold">4</span>
            Languages you speak or understand
          </h2>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#312E81] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          >
            <SkipForward className="w-3.5 h-3.5" /> Skip for now
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#171717] font-bold rounded-xl text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Start Exploring India'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
