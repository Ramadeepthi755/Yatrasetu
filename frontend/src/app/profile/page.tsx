'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  UserCircle,
  Mail,
  MapPin,
  Compass,
  ShieldCheck,
  Edit3,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, updateTravelerProfile, openAuthModal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.fullName || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Comfortable Explorer');
  const [budgetPref, setBudgetPref] = useState(user?.budgetPreference || 'Mid-Range');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
          <UserCircle className="w-12 h-12 text-[#312E81] mx-auto" />
          <h2 className="text-xl font-bold text-[#171717]">Sign In to View Profile</h2>
          <p className="text-xs text-[#64748B]">
            You need to be signed in to manage your traveler profile and travel preferences.
          </p>
          <button
            onClick={() => openAuthModal('TRAVELER')}
            className="inline-block px-5 py-2.5 bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            Sign In as Traveler
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateTravelerProfile({
        displayName,
        city,
        state,
        bio,
        travelStyle,
        budgetPreference: budgetPref,
      });
      setMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#171717]">
                  {user?.displayName || user?.fullName}
                </h1>
                {user?.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[#312E81] font-medium uppercase text-[10px]">
                  {user?.role}
                </span>
              </div>
              {(user?.city || user?.state) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>{[user?.city, user?.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {msg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {msg}
          </div>
        )}
      </div>

      {/* Edit Mode vs View Mode */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5">
          <h2 className="text-lg font-bold text-[#171717]">Edit Traveler Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#312E81] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#312E81] outline-none"
              >
                <option value="Comfortable Explorer">Comfortable Explorer</option>
                <option value="Budget / Backpacker">Budget / Backpacker</option>
                <option value="Luxury & Heritage">Luxury & Heritage</option>
                <option value="Solo Traveler">Solo Traveler</option>
                <option value="Family & Relaxed">Family & Relaxed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#312E81] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#312E81] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
              Bio / About Me
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other travelers and local hosts about your passion for exploring India..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#312E81] outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#312E81] text-white text-xs font-bold hover:bg-[#1E1B4B]"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferences Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#F59E0B]" />
              Travel Preferences
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Travel Style:</span>
                <span className="font-semibold text-[#171717]">{user?.travelStyle || 'Explorer'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Budget Range:</span>
                <span className="font-semibold text-[#171717]">{user?.budgetPreference || 'Mid-Range'}</span>
              </div>
              <div className="py-1.5">
                <span className="text-slate-500 block mb-2">Interests:</span>
                <div className="flex flex-wrap gap-1.5">
                  {user?.interests && user.interests.length > 0 ? (
                    user.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 rounded-full bg-indigo-50 text-[#312E81] text-[11px] font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No interests selected yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About / Bio Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0F766E]" />
              About Traveler
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {user?.bio ||
                'Passionate traveler discovering the rich heritage, authentic food, and vibrant cultural landscapes of India.'}
            </p>
            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/onboarding/traveler"
                className="text-xs font-semibold text-[#312E81] hover:underline flex items-center gap-1"
              >
                Reconfigure Travel Preferences →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
