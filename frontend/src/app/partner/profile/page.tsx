'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  MapPin,
  Clock,
  Edit3,
  Check,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

export default function PartnerProfilePage() {
  const { user, partnerDetails, role, isAuthenticated, updatePartner, openAuthModal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState(partnerDetails?.businessName || '');
  const [city, setCity] = useState(partnerDetails?.city || '');
  const [state, setState] = useState(partnerDetails?.state || '');
  const [bio, setBio] = useState(partnerDetails?.bio || '');
  const [skills, setSkills] = useState(partnerDetails?.partnerSkills?.join(', ') || '');
  const [languages, setLanguages] = useState(partnerDetails?.languages?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isAuthenticated || role !== 'PARTNER') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">Partner Account Required</h2>
          <p className="text-xs text-[#64748B]">
            Sign in as a verified partner to manage your services and business profile.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => openAuthModal('PARTNER')}
              className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              Sign In as Local Partner
            </button>
            <Link
              href="/explore"
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const skillsArr = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const langsArr = languages.split(',').map((l) => l.trim()).filter(Boolean);

      await updatePartner({
        businessName,
        city,
        state,
        bio,
        partnerSkills: skillsArr,
        languages: langsArr,
      });

      setMsg('Partner profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMsg('Failed to update partner profile.');
    } finally {
      setSaving(false);
    }
  };

  const vStatus = partnerDetails?.verificationStatus || 'PENDING';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/partner/dashboard"
          className="text-xs text-slate-500 hover:text-[#171717] flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          {isEditing ? 'Cancel' : 'Edit Business Profile'}
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {msg}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#171717]">
                  {partnerDetails?.businessName || user?.fullName}
                </h1>
                {vStatus === 'APPROVED' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Role Subtype: <span className="font-semibold text-[#0F766E]">{partnerDetails?.partnerSubtype}</span>
              </p>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  Business / Listing Title
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  City / Destination Hub
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F766E] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Bio & Service Specialization
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F766E] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  Skills & Offerings
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F766E] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                  Languages
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F766E] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold hover:bg-[#0D9488]"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold uppercase block mb-1">About & Services</span>
              <p className="text-[#64748B] leading-relaxed">
                {partnerDetails?.bio ||
                  'Certified local host providing authentic cultural and storytelling tours in regional circuits.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="text-slate-500 font-semibold uppercase block mb-2">Offerings & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {partnerDetails?.partnerSkills && partnerDetails.partnerSkills.length > 0 ? (
                    partnerDetails.partnerSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-teal-50 text-[#0F766E] font-medium">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No skills listed</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase block mb-2">Spoken Languages</span>
                <div className="flex flex-wrap gap-1.5">
                  {partnerDetails?.languages && partnerDetails.languages.length > 0 ? (
                    partnerDetails.languages.map((l) => (
                      <span key={l} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {l}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No languages specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
