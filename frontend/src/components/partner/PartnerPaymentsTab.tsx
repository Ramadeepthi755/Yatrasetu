'use client';

import React from 'react';
import {
  IndianRupee,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { ExperienceBooking } from '@/lib/api';

interface PartnerPaymentsTabProps {
  bookings: ExperienceBooking[];
}

export default function PartnerPaymentsTab({ bookings }: PartnerPaymentsTabProps) {
  // Compute Milestones
  const totalVolume = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const completedVolume = bookings
    .filter((b) => b.status === 'COMPLETED' && b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const inProgressVolume = bookings
    .filter((b) => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(b.status) && b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#171717]">Payment Milestone & Earnings Ledger</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Milestone Tracking
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Track tourist milestone allocations across initial advance booking, active transit, and recorded completion states (settlement processed directly per agreement).
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Volume Secured</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#171717]">₹{totalVolume.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400">All authenticated guest reservations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Circuit Value</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">₹{completedVolume.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Completed & verified circuits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In-Progress Milestones</span>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">₹{inProgressVolume.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-indigo-600 font-medium">Under active transit / pending release</p>
        </div>
      </div>

      {/* Milestone Explanation Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-[#1E3E62] text-white p-5 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Three-Tier Milestone Protection Protocol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-white block mb-0.5">1. Initial Payment</span>
            <p className="text-slate-300 text-[11px]">
              Secured at reservation to lock guide availability and reserve supporting partner slots.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-white block mb-0.5">2. Trip Progress</span>
            <p className="text-slate-300 text-[11px]">
              Safety checkpoints logged in real time as the circuit proceeds across regional sites.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="font-bold text-white block mb-0.5">3. Final Completion State</span>
            <p className="text-slate-300 text-[11px]">
              Recorded upon safe trip completion and tourist satisfaction confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Records Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider">Transaction Ledger</h3>
          <span className="text-xs text-slate-500">{bookings.length} Records</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">No payment transactions recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => {
              const milestoneText =
                b.status === 'COMPLETED'
                  ? 'Final Milestone Released'
                  : b.status === 'IN_PROGRESS' || b.status === 'COMPLETION_PENDING'
                  ? 'Trip In Progress'
                  : b.paymentStatus === 'PAID'
                  ? 'Initial Payment Secured'
                  : 'Awaiting Tourist Payment';

              return (
                <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#171717]">{b.experienceTitle || 'Custom Circuit'}</span>
                      <span className="font-mono text-slate-400 text-[11px]">#{b.bookingReference}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Guest: <span className="font-semibold text-slate-700">{b.touristName}</span> · Date: {b.bookingDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-bold text-sm text-[#171717] block">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500">{b.paymentStatus === 'PAID' ? 'Payment Verified' : 'Payment Processing'}</span>
                    </div>

                    <div className="min-w-[140px] text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.paymentStatus === 'PAID'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {milestoneText}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
