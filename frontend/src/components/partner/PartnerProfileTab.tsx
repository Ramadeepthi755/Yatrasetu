'use client';

import React, { useState } from 'react';
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Compass,
  Palette,
  CheckCircle,
  AlertCircle,
  Save,
  Tag,
} from 'lucide-react';
import { updatePartnerProfile } from '@/lib/api';

interface PartnerProfileTabProps {
  partnerDetails: any;
  user: any;
  token: string | null;
  onRefreshProfile: () => void;
}

export default function PartnerProfileTab({
  partnerDetails,
  user,
  token,
  onRefreshProfile,
}: PartnerProfileTabProps) {
  const [formData, setFormData] = useState({
    businessName: partnerDetails?.businessName || user?.fullName || '',
    bio: partnerDetails?.bio || '',
    city: partnerDetails?.city || '',
    state: partnerDetails?.state || '',
    languages: partnerDetails?.languages?.join(', ') || 'English, Hindi',
    partnerSubtype: partnerDetails?.partnerSubtype || 'GUIDE',
    partnerSkills: partnerDetails?.partnerSkills?.join(', ') || 'Heritage Tours, Local History, Cultural Storytelling',
    contactPhone: user?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        businessName: formData.businessName,
        bio: formData.bio,
        city: formData.city,
        state: formData.state,
        languages: formData.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
        partnerSubtype: formData.partnerSubtype,
        partnerSkills: formData.partnerSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      const res = await updatePartnerProfile(payload, token);
      if (res.success) {
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
        onRefreshProfile();
      } else {
        setMsg({ text: res.message || 'Failed to update profile', type: 'error' });
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Error saving profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#171717]">Partner Profile & Public Presence</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Information displayed to tourists browsing regional circuits and verified guide recommendations.
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              Business / Public Display Name
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              Provider Category / Role
            </label>
            <select
              value={formData.partnerSubtype}
              onChange={(e) => setFormData({ ...formData, partnerSubtype: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
            >
              <option value="GUIDE">Certified Tour Guide</option>
              <option value="LOCAL_HOST">Local Heritage Host</option>
              <option value="HOTEL">Hotel & Accommodations</option>
              <option value="ARTISAN">Master Artisan / Craftsperson</option>
              <option value="LOCAL_BUSINESS">Local Cultural Business</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              City / Destination Base
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Varanasi, Hampi, Jaipur"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              State / Region
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Uttar Pradesh, Karnataka, Rajasthan"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              Spoken Languages (comma separated)
            </label>
            <input
              type="text"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="English, Hindi, Bengali, French"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              Offerings, Skills & Specializations (comma separated)
            </label>
            <input
              type="text"
              value={formData.partnerSkills}
              onChange={(e) => setFormData({ ...formData, partnerSkills: e.target.value })}
              placeholder="Architectural Heritage, Culinary Trails, Handicraft Demonstration, Ancient Inscriptions"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
              Professional Bio & Heritage Story
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Share your years of local experience, passion for cultural preservation, and what makes your circuits unique..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E] leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
