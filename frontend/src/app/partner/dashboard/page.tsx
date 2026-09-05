'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  IndianRupee,
  Users,
  AlertCircle
} from 'lucide-react';
import {
  getPartnerExperiences,
  createPartnerExperience,
  updatePartnerExperience,
  deletePartnerExperience,
  ExperienceItem
} from '@/lib/api';

export default function PartnerDashboardPage() {
  const { user, partnerDetails, token, role, isAuthenticated, openAuthModal } = useAuth();

  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loadingExps, setLoadingExps] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Heritage Tour',
    description: '',
    durationHours: 3.0,
    pricePerPerson: 900,
    maxGroupSize: 8,
    includedItems: 'Local expert guide, Heritage walking map, Refreshments',
    requirements: 'Comfortable walking shoes',
    languages: 'English, Hindi',
    coverImageUrl: '',
  });

  const loadExperiences = useCallback(async () => {
    if (!token) return;
    setLoadingExps(true);
    try {
      const res = await getPartnerExperiences(token);
      if (res.success && res.data) {
        setExperiences(res.data);
      }
    } catch (err: unknown) {
      console.error('Error fetching experiences:', err);
    } finally {
      setLoadingExps(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && role === 'PARTNER') {
      loadExperiences();
    }
  }, [isAuthenticated, role, loadExperiences]);

  const handleOpenCreate = () => {
    setEditingExp(null);
    setFormData({
      title: '',
      category: 'Heritage Tour',
      description: '',
      durationHours: 3.0,
      pricePerPerson: 900,
      maxGroupSize: 8,
      includedItems: 'Local expert guide, Heritage walking map, Refreshments',
      requirements: 'Comfortable walking shoes',
      languages: 'English, Hindi',
      coverImageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80',
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (exp: ExperienceItem) => {
    setEditingExp(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      description: exp.description.replace(/^\[SAMPLE\]\s*/i, ''),
      durationHours: exp.durationHours,
      pricePerPerson: exp.pricePerPerson,
      maxGroupSize: exp.maxGroupSize,
      includedItems: exp.includedItems ? exp.includedItems.join(', ') : '',
      requirements: exp.requirements || '',
      languages: exp.languages ? exp.languages.join(', ') : 'English, Hindi',
      coverImageUrl: exp.coverImageUrl || '',
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await deletePartnerExperience(id, token || undefined);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete experience';
      alert(errorMsg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const payload: Partial<ExperienceItem> = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      durationHours: Number(formData.durationHours),
      pricePerPerson: Number(formData.pricePerPerson),
      maxGroupSize: Number(formData.maxGroupSize),
      includedItems: formData.includedItems.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: formData.requirements.trim() || undefined,
      languages: formData.languages.split(',').map((s) => s.trim()).filter(Boolean),
      coverImageUrl: formData.coverImageUrl.trim() || undefined,
    };

    try {
      if (editingExp) {
        const res = await updatePartnerExperience(editingExp.id, payload, token || undefined);
        if (res.success && res.data) {
          setExperiences((prev) => prev.map((e) => (e.id === editingExp.id ? res.data : e)));
        }
      } else {
        const res = await createPartnerExperience(payload, token || undefined);
        if (res.success && res.data) {
          setExperiences((prev) => [res.data, ...prev]);
        }
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save experience';
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Role Gate
  if (!isAuthenticated || role !== 'PARTNER') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">Partner Access Required</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            This dashboard is dedicated to verified local tourism partners, guides, and experience hosts.
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

  const vStatus = partnerDetails?.verificationStatus || 'PENDING';

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner: Verification Status */}
      {vStatus === 'PENDING' ? (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-950">Partner Verification in Progress</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide">
                  Pending Review
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your profile has been submitted to local authorities. You can prepare and publish your experiences while verification is underway.
              </p>
            </div>
          </div>
          <Link
            href="/partner/profile"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex-shrink-0"
          >
            Review Profile
          </Link>
        </div>
      ) : vStatus === 'APPROVED' ? (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-emerald-950">Verified Partner Account</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold uppercase">
                Verified
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Your profile carries the official YatraSetu verified trust seal across destination listings.
            </p>
          </div>
        </div>
      ) : null}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            {partnerDetails?.businessName || user?.fullName}&apos;s Partner Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] flex items-center gap-2 mt-1">
            <span className="font-semibold text-[#0F766E]">{partnerDetails?.partnerSubtype || 'LOCAL_HOST'}</span>
            {partnerDetails?.city && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {partnerDetails.city}, {partnerDetails.state}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Experience
          </button>
          <Link
            href="/partner/profile"
            className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Experiences
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">{experiences.length}</div>
          <span className="text-[10px] text-teal-600 font-medium">Published Listings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Inquiries
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">12</div>
          <span className="text-[10px] text-emerald-600 font-medium">Verified Inquiries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">₹18,500</div>
          <span className="text-[10px] text-slate-400">Direct Local Payouts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Partner Trust Score
          </span>
          <div className="text-2xl font-extrabold text-[#0F766E]">4.9 / 5.0</div>
          <span className="text-[10px] text-teal-600 font-medium">Verified Status</span>
        </div>
      </div>

      {/* My Experiences Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#171717] flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
              My Experiences & Walking Tours
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Manage your published experiences, pricing, and guest capacity
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add New
          </button>
        </div>

        {/* Experience Cards List */}
        {loadingExps ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading your experiences...
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No experiences published yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first walking tour, artisan workshop, or culinary walk to start receiving travelers.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow transition-colors"
            >
              Publish First Experience
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      {exp.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Experience"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-stone-900 mt-2 text-base leading-snug">
                    {exp.title}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {exp.description.replace(/^\[SAMPLE\]\s*/i, '')}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      {exp.durationHours} hrs
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      Up to {exp.maxGroupSize} guests
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center font-bold text-stone-900">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{Number(exp.pricePerPerson).toLocaleString('en-IN')}</span>
                    <span className="text-[11px] font-normal text-stone-400"> /person</span>
                  </div>

                  <Link
                    href={`/experiences/${exp.id}`}
                    className="text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    View Public Page →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Experience */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingExp ? 'Edit Experience' : 'Publish New Experience'}
                </h3>
                <p className="text-xs text-stone-500">
                  Protected with strict server-side partner ownership authorization
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dawn Heritage Ghats & Hidden Alleys Walk"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Heritage Tour">Heritage Tour</option>
                    <option value="Craft Workshop">Craft Workshop</option>
                    <option value="Food Walk">Food Walk</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Photography">Photography</option>
                    <option value="Spiritual Walk">Spiritual Walk</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price / Person (₹ INR) *</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={formData.pricePerPerson}
                    onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) || 100 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Max Group Size *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.maxGroupSize}
                    onChange={(e) => setFormData({ ...formData, maxGroupSize: parseInt(e.target.value, 10) || 8 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the journey, stories, stops, and what makes it extraordinary..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">What&apos;s Included (Comma separated)</label>
                <input
                  type="text"
                  value={formData.includedItems}
                  onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                  placeholder="e.g. Certified guide, Sunrise boat ride, Traditional chai"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Requirements</label>
                  <input
                    type="text"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g. Comfortable walking sneakers"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g. English, Hindi, Bengali"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Cover Photo URL</label>
                <input
                  type="url"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-stone-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingExp ? 'Update Experience' : 'Publish Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
