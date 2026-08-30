'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';

export default function PartnerDashboardPage() {
  const { user, partnerDetails, role, isAuthenticated, loginAsDemo } = useAuth();

  // Role Gate
  if (!isAuthenticated || role !== 'PARTNER') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#171717]">Partner Access Required</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            This dashboard is dedicated to verified local tourism partners, guides, and experience hosts.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => loginAsDemo('PARTNER')}
              className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold rounded-xl shadow transition-colors"
            >
              Sign In as Demo Partner
            </button>
            <Link
              href="/login"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold rounded-xl transition-colors"
            >
              Back to Login
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
                Your profile has been submitted to local authorities. You can prepare your experience catalog while verification is underway.
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
              Your profile carries the official YatraSetu verified trust seal.
            </p>
          </div>
        </div>
      ) : null}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
            {partnerDetails?.businessName || user?.fullName}&apos;s Dashboard
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

        <Link
          href="/partner/profile"
          className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Briefcase className="w-4 h-4" />
          Manage Partner Profile
        </Link>
      </div>

      {/* Foundation Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Inquiries
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">0</div>
          <span className="text-[10px] text-emerald-600 font-medium">Phase 1 & 2 Foundation Ready</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Bookings
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">0</div>
          <span className="text-[10px] text-slate-400">Scheduled for Phase 8</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="text-2xl font-extrabold text-[#171717]">₹0</div>
          <span className="text-[10px] text-slate-400">Direct Local Payouts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Partner Trust Score
          </span>
          <div className="text-2xl font-extrabold text-[#0F766E]">4.8 / 5.0</div>
          <span className="text-[10px] text-teal-600 font-medium">Verified Criteria</span>
        </div>
      </div>
    </div>
  );
}
