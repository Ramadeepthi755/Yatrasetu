'use client';

import React from 'react';
import {
  Compass,
  ShieldCheck,
  CheckCircle,
  Clock,
  IndianRupee,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  Palette,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Zap,
  QrCode,
} from 'lucide-react';
import { ExperienceBooking, ExperienceItem, HotelItem, PartnerReview, ExperienceSupportingProvider } from '@/lib/api';

interface PartnerOverviewTabProps {
  providerType: string;
  partnerName: string;
  location: string;
  verificationStatus: string;
  profileCompletion: {
    percentage: number;
    checks: { label: string; done: boolean; required?: boolean }[];
    completed: number;
    total: number;
  };
  experiences: ExperienceItem[];
  hotels: HotelItem[];
  bookings: ExperienceBooking[];
  participations: ExperienceSupportingProvider[];
  reviews: PartnerReview[];
  onNavigateTab: (tab: string) => void;
  onOpenCreateExperience: () => void;
  onOpenCreateHotel: () => void;
  onOpenVerifyQr?: () => void;
}

export default function PartnerOverviewTab({
  providerType,
  partnerName,
  location,
  verificationStatus,
  profileCompletion,
  experiences,
  hotels,
  bookings,
  participations,
  reviews,
  onNavigateTab,
  onOpenCreateExperience,
  onOpenCreateHotel,
  onOpenVerifyQr,
}: PartnerOverviewTabProps) {
  // Compute Key Metrics
  const activeBookings = bookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(b.status));
  const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const pendingParticipations = participations.filter((p) => p.status === 'INVITED');

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '5.0';

  const isVerified = verificationStatus === 'APPROVED' || verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome & Completion Banner */}
      <div className="bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0F766E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wider uppercase border border-white/10 flex items-center gap-1.5">
                {providerType === 'GUIDE' && <Compass className="w-3.5 h-3.5 text-amber-400" />}
                {providerType === 'HOTEL' && <Building2 className="w-3.5 h-3.5 text-sky-400" />}
                {providerType === 'ARTISAN' && <Palette className="w-3.5 h-3.5 text-emerald-400" />}
                {providerType.replace('_', ' ')}
              </span>
              <span className="text-xs text-white/70">· {location || 'Regional Tourism Circuit'}</span>
              {isVerified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> YatraSetu Verified
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Verification Pending
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {partnerName || 'Local Partner'}
            </h1>
            <p className="text-sm text-slate-200/90 max-w-2xl leading-relaxed">
              Manage your verified local tours, guest reservations, live safety checkpoints, and authentic cultural
              collaborations in real time.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/80">Profile Readiness</span>
              <span className="text-emerald-300 text-sm font-bold">{profileCompletion.percentage}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-white/70">
                {profileCompletion.completed} of {profileCompletion.total} items completed
              </span>
              <button
                onClick={() => onNavigateTab('PROFILE')}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
              >
                Complete Profile <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Listings / Stays */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {providerType === 'HOTEL' ? 'Active Properties' : 'Active Experiences'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
              {providerType === 'HOTEL' ? <Building2 className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#171717]">
            {providerType === 'HOTEL' ? hotels.length : experiences.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Live in regional catalog</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#171717]">
            {pendingRequests.length + pendingParticipations.length}
          </div>
          <p className="text-xs text-amber-600 font-medium mt-1">
            {pendingRequests.length > 0 ? `${pendingRequests.length} custom quotes needed` : 'No action required'}
          </p>
        </div>

        {/* Active & Upcoming Trips */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirmed Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#171717]">{activeBookings.length}</div>
          <p className="text-xs text-indigo-600 font-medium mt-1">Ready for departure / check-in</p>
        </div>

        {/* Total Earnings / Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secured Volume</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#171717]">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-800">{avgRating}</span>
            <span>({reviews.length} verified reviews)</span>
          </div>
        </div>
      </div>

      {/* Main Action & Status Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Quick Action Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Trip Requests Preview Banner */}
          {pendingRequests.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-amber-900">
                    {pendingRequests.length} Custom Trip {pendingRequests.length === 1 ? 'Inquiry' : 'Inquiries'} Awaiting Response
                  </h2>
                  <p className="text-xs text-amber-700/90 mt-0.5">
                    Tourists have requested specialized itineraries tailored to their interests and dates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('REQUESTS')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                Review Requests & Quote
              </button>
            </div>
          )}

          {/* Supporting Provider Participation Invitations */}
          {pendingParticipations.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-emerald-900">
                    {pendingParticipations.length} Supporting Collaboration {pendingParticipations.length === 1 ? 'Invite' : 'Invites'}
                  </h2>
                  <p className="text-xs text-emerald-700/90 mt-0.5">
                    Regional tour operators and guides have invited you to participate as a cultural expert.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('PARTICIPATIONS')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
              >
                View Invitations
              </button>
            </div>
          )}

          {/* Quick Action Navigation Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[#171717] uppercase tracking-wider">Management Workflows</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providerType === 'HOTEL' ? (
                <>
                  <button
                    onClick={onOpenCreateHotel}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/40 text-left transition-all group flex items-start justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#171717]">Register New Stay</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">List a homestay, heritage hotel, or resort</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => onNavigateTab('HOTELS')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/40 text-left transition-all group flex items-start justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#171717]">Manage Room Inventory</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Configure rate plans, dates, and blocks</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={onOpenVerifyQr || (() => onNavigateTab('HOTELS'))}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group flex items-start justify-between sm:col-span-2"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#171717]">Scan &amp; Verify Guest QR Pass</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Front desk QR token verification and instant reception check-in</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onOpenCreateExperience}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/40 text-left transition-all group flex items-start justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Compass className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#171717]">Create Tour / Experience</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Publish cultural tours, craft workshops, or walks
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    onClick={() => onNavigateTab('REQUESTS')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/40 text-left transition-all group flex items-start justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#171717]">Custom Trip Proposals</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Respond to direct tourist requests</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </>
              )}

              <button
                onClick={() => onNavigateTab('TRIPS')}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/40 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#171717]">Live Trip Safety Console</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Check-in at checkpoints and verify safe transit</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('PAYMENTS')}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/40 text-left transition-all group flex items-start justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#171717]">Payment Milestone Ledger</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Track initial payments, progress, and releases</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Checklist & Verification Status */}
        <div className="space-y-6">
          {/* Verification Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" /> Verification Center
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isVerified ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isVerified
                ? 'Your credentials and identity have been verified by YatraSetu regional moderators. Your listings receive priority placement.'
                : 'Upload your identity documentation and regional accreditation license to become discoverable across circuit itineraries.'}
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-700">Identity Document</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-700">Category Credential</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-700">Business Registration</span>
                <span className="text-slate-500 font-medium">Standard</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('VERIFICATION')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-bold rounded-xl transition-colors text-center"
            >
              Open Verification Center
            </button>
          </div>

          {/* Profile Completion Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0F766E]" /> Profile Checklist
              </span>
              <span className="text-xs font-bold text-[#0F766E]">{profileCompletion.percentage}%</span>
            </div>

            <div className="space-y-2">
              {profileCompletion.checks.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    {c.done ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px]">
                        ○
                      </span>
                    )}
                    <span className={c.done ? 'text-slate-700' : 'text-slate-500 font-medium'}>{c.label}</span>
                  </div>
                  {c.done ? (
                    <span className="text-[10px] font-bold text-emerald-600">Complete</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-600">Pending</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('PROFILE')}
              className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl transition-colors text-center shadow-sm"
            >
              Update Profile Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
