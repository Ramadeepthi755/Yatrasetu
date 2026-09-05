'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Compass,
  Palette,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  IndianRupee,
  Users,
  AlertCircle,
  Store,
  Landmark,
} from 'lucide-react';
import {
  getPartnerExperiences,
  createPartnerExperience,
  updatePartnerExperience,
  deletePartnerExperience,
  ExperienceItem
} from '@/lib/api';

const CULTURAL_CATEGORIES = [
  'Handicraft / Artisan',
  'Cultural Workshop',
  'Traditional Food / Culinary',
  'Folk Art / Performance',
  'Local Cultural Business',
  'Traditional Product',
  'Heritage Craft',
];

const TOUR_CATEGORIES = [
  'Heritage Tour',
  'Food Walk',
  'Adventure',
  'Photography',
  'Spiritual Walk',
  'Nature Trail',
];

export default function PartnerDashboardPage() {
  const { user, partnerDetails, token, role, isAuthenticated, openAuthModal } = useAuth();

  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loadingExps, setLoadingExps] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'EXPERIENCES' | 'CULTURE'>('EXPERIENCES');

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

  const handleOpenCreate = (initialCategory = 'Heritage Tour') => {
    setEditingExp(null);
    setFormData({
      title: '',
      category: initialCategory,
      description: '',
      durationHours: 3.0,
      pricePerPerson: 900,
      maxGroupSize: 8,
      includedItems: 'Local artisan demonstration, Materials, Refreshments',
      requirements: 'Open for all enthusiasts',
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
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deletePartnerExperience(id, token || undefined);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete listing';
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to save listing';
      setActionError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const culturalListings = useMemo(() => {
    return experiences.filter((e) => CULTURAL_CATEGORIES.includes(e.category) || e.category.toLowerCase().includes('craft') || e.category.toLowerCase().includes('art') || e.category.toLowerCase().includes('culture'));
  }, [experiences]);

  const regularListings = useMemo(() => {
    return experiences.filter((e) => !culturalListings.includes(e));
  }, [experiences, culturalListings]);

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
            This dashboard is dedicated to verified local tourism partners, guides, artisans, and cultural operators.
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
                Your profile has been submitted to local authorities. You can prepare and publish your experiences and cultural listings while verification is underway.
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
            onClick={() => handleOpenCreate('Handicraft / Artisan')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4" />
            Add Cultural Listing
          </button>
          <button
            onClick={() => handleOpenCreate('Heritage Tour')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Experience
          </button>
          <Link
            href="/partner/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Metric Cards - Honest Demo Labeling */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Listings
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">{experiences.length}</div>
          <span className="text-[10px] text-teal-600 font-medium">
            {culturalListings.length} Culture • {regularListings.length} Tours
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Inquiries
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Demo
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">12</div>
          <span className="text-[10px] text-slate-500 font-medium">Sample Partner Activity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Revenue
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Demo
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#171717]">₹18,500</div>
          <span className="text-[10px] text-slate-500">Simulated Payouts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Trust Score
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Sample
            </span>
          </div>
          <div className="text-2xl font-extrabold text-[#0F766E]">4.9 / 5.0</div>
          <span className="text-[10px] text-teal-600 font-medium">Community Rating</span>
        </div>
      </div>

      {/* Tabs: Tours & Experiences vs Local Culture & Artisans */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('EXPERIENCES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'EXPERIENCES'
              ? 'bg-amber-500 text-stone-950 shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Tours &amp; Experiences ({regularListings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('CULTURE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'CULTURE'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Local Culture &amp; Artisans ({culturalListings.length})</span>
        </button>
      </div>

      {/* Listings Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#171717] flex items-center">
              {activeTab === 'CULTURE' ? (
                <>
                  <Palette className="w-5 h-5 mr-2 text-teal-700" />
                  Local Culture &amp; Artisan Hub ({culturalListings.length})
                </>
              ) : (
                <>
                  <Compass className="w-5 h-5 mr-2 text-amber-600" />
                  Tours &amp; Guided Experiences ({regularListings.length})
                </>
              )}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {activeTab === 'CULTURE'
                ? 'Showcase authentic local crafts, cultural workshops, and community businesses.'
                : 'Manage your published tours, pricing, and guest capacity'}
            </p>
          </div>
          <button
            onClick={() => handleOpenCreate(activeTab === 'CULTURE' ? 'Handicraft / Artisan' : 'Heritage Tour')}
            className={`text-xs font-bold flex items-center ${
              activeTab === 'CULTURE' ? 'text-teal-700 hover:text-teal-800' : 'text-amber-600 hover:text-amber-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {activeTab === 'CULTURE' ? 'Add Cultural Listing' : 'Add Experience'}
          </button>
        </div>

        {/* Listings Cards List */}
        {loadingExps ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading your listings...
          </div>
        ) : (activeTab === 'CULTURE' ? culturalListings : regularListings).length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
            {activeTab === 'CULTURE' ? (
              <Palette className="w-8 h-8 text-teal-600 mx-auto" />
            ) : (
              <Compass className="w-8 h-8 text-amber-500 mx-auto" />
            )}
            <h4 className="text-sm font-bold text-slate-800">
              {activeTab === 'CULTURE'
                ? 'No cultural listings published yet'
                : 'No tour experiences published yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'CULTURE'
                ? 'Showcase authentic local crafts, pottery, handloom, culinary workshops, or folk art to connect travelers with living heritage.'
                : 'Create your first walking tour, heritage circuit, or nature exploration to start receiving travelers.'}
            </p>
            <button
              onClick={() => handleOpenCreate(activeTab === 'CULTURE' ? 'Handicraft / Artisan' : 'Heritage Tour')}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow transition-colors ${
                activeTab === 'CULTURE'
                  ? 'bg-teal-700 hover:bg-teal-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              {activeTab === 'CULTURE' ? 'Publish Cultural Listing' : 'Publish First Experience'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'CULTURE' ? culturalListings : regularListings).map((exp) => (
              <div
                key={exp.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        CULTURAL_CATEGORIES.includes(exp.category)
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {exp.category}
                      </span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200">
                        PARTNER_SUBMITTED
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Listing"
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
                      Up to {exp.maxGroupSize} participants
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

      {/* Modal: Create / Edit Experience or Cultural Listing */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingExp
                    ? (CULTURAL_CATEGORIES.includes(formData.category) ? 'Edit Cultural Listing' : 'Edit Experience')
                    : (activeTab === 'CULTURE' ? 'Publish Cultural Listing' : 'Publish New Experience')}
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
                  placeholder={
                    activeTab === 'CULTURE'
                      ? 'e.g. Traditional Kalamkari Hand-Painting Workshop'
                      : 'e.g. Dawn Heritage Ghats & Hidden Alleys Walk'
                  }
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
                    <optgroup label="Local Culture & Artisans">
                      {CULTURAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Tours & Sights">
                      {TOUR_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
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
                  placeholder={
                    activeTab === 'CULTURE'
                      ? 'Describe the authentic craft tradition, master artisan history, workshop process, and materials...'
                      : 'Describe the journey, stories, stops, and what makes it extraordinary...'
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-stone-900 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">What&apos;s Included (Comma separated)</label>
                <input
                  type="text"
                  value={formData.includedItems}
                  onChange={(e) => setFormData({ ...formData, includedItems: e.target.value })}
                  placeholder="e.g. Master artisan guidance, Raw materials, Take-home craft piece, Chai"
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
                    placeholder="e.g. Open to all skill levels"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-stone-900 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="e.g. English, Hindi, Telugu"
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
                  placeholder="https://upload.wikimedia.org/..."
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
                  className={`px-5 py-2 rounded-xl font-bold shadow disabled:opacity-50 ${
                    activeTab === 'CULTURE'
                      ? 'bg-teal-700 hover:bg-teal-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  }`}
                >
                  {submitting
                    ? 'Saving...'
                    : editingExp
                    ? 'Update Listing'
                    : activeTab === 'CULTURE'
                    ? 'Publish Cultural Listing'
                    : 'Publish Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
