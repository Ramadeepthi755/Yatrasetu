'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  Edit3,
  Send,
  AlertCircle,
  MessageSquare,
  FileText,
  X,
  Search,
  Check,
} from 'lucide-react';
import { ExperienceBooking } from '@/lib/api';

interface PartnerRequestsTabProps {
  bookings: ExperienceBooking[];
  onAccept: (bookingId: string) => Promise<void>;
  onReject: (bookingId: string, reason: string) => Promise<void>;
  onCustomize: (bookingId: string, itinerary: string, customPrice: number) => Promise<void>;
  refreshBookings: () => void;
}

export default function PartnerRequestsTab({
  bookings,
  onAccept,
  onReject,
  onCustomize,
  refreshBookings,
}: PartnerRequestsTabProps) {
  // Filter for Custom Trip Requests or general inquiries
  const customRequests = bookings.filter(
    (b) => b.bookingType === 'CUSTOMIZED' || b.status === 'REQUESTED' || b.status === 'PAYMENT_PENDING'
  );

  const [selectedBookingForQuote, setSelectedBookingForQuote] = useState<ExperienceBooking | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [customItinerary, setCustomItinerary] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(1500);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingForReject, setSelectedBookingForReject] = useState<ExperienceBooking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleOpenQuote = (b: ExperienceBooking) => {
    setSelectedBookingForQuote(b);
    setCustomItinerary(
      b.customItinerary ||
        `Customized Cultural Circuit:\n- Morning: Private Guided Tour of Heritage Complex & Architecture\n- Mid-Day: Authentic Artisan Workshop & Craft Demonstration\n- Afternoon: Traditional Gastronomy & Storytelling Session\n- Evening: Cultural Riverbank Sunset Point & Return`
    );
    setCustomPrice(b.totalAmount || 1800);
    setQuoteModalOpen(true);
  };

  const handleOpenReject = (b: ExperienceBooking) => {
    setSelectedBookingForReject(b);
    setRejectReason('Schedule conflict on the requested date. Available on adjacent dates.');
    setRejectModalOpen(true);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForQuote) return;
    setSubmittingQuote(true);
    setActionMsg(null);
    try {
      await onCustomize(selectedBookingForQuote.id, customItinerary, customPrice);
      setActionMsg({ text: 'Custom proposal and price quote submitted to tourist!', type: 'success' });
      setQuoteModalOpen(false);
      refreshBookings();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to submit customized quote.', type: 'error' });
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReject) return;
    setSubmittingReject(true);
    setActionMsg(null);
    try {
      await onReject(selectedBookingForReject.id, rejectReason);
      setActionMsg({ text: 'Request declined and notification sent to tourist.', type: 'success' });
      setRejectModalOpen(false);
      refreshBookings();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to decline request.', type: 'error' });
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleDirectAccept = async (bookingId: string) => {
    setActionMsg(null);
    try {
      await onAccept(bookingId);
      setActionMsg({ text: 'Request accepted! Tourist notified to complete payment.', type: 'success' });
      refreshBookings();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to accept booking.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#171717]">Custom Trip Requests</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {customRequests.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tourists submit custom requests for personalized circuits, dates, group sizes, and specialized interests.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {actionMsg.text}
        </div>
      )}

      {/* Requests List */}
      {customRequests.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171717]">No Pending Custom Trip Inquiries</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When tourists request customized itineraries in your destination circuit, they will appear here for you to
            review, customize, and quote.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customRequests.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                    {b.touristName ? b.touristName[0].toUpperCase() : 'T'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#171717]">{b.touristName || 'Verified Traveler'}</h4>
                      <span className="text-xs text-slate-400">· {b.bookingReference}</span>
                    </div>
                    <span className="text-xs text-slate-500">{b.touristEmail || 'Direct Traveler Inquiry'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      b.status === 'REQUESTED'
                        ? 'bg-amber-100 text-amber-800'
                        : b.status === 'PAYMENT_PENDING'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                    {b.bookingType}
                  </span>
                </div>
              </div>

              {/* Trip details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time
                  </span>
                  <span className="font-bold text-[#171717]">
                    {b.bookingDate} {b.startTime && `· ${b.startTime}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Group Size
                  </span>
                  <span className="font-bold text-[#171717]">{b.guestCount} Guests</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Destination
                  </span>
                  <span className="font-bold text-[#171717] truncate block">
                    {b.destinationName || 'Regional Hub'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Budget / Quote
                  </span>
                  <span className="font-bold text-emerald-700">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Requirements & Custom Itinerary */}
              {b.customRequirements && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-700" /> Tourist Specific Requirements:
                  </span>
                  <p className="text-amber-800 leading-relaxed">{b.customRequirements}</p>
                </div>
              )}

              {b.customItinerary && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Proposed Customized Itinerary:</span>
                  <pre className="text-slate-600 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {b.customItinerary}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenReject(b)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>

                <button
                  onClick={() => handleOpenQuote(b)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modify & Submit Proposal
                </button>

                {b.status === 'REQUESTED' && (
                  <button
                    onClick={() => handleDirectAccept(b.id)}
                    className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote / Proposal Modal */}
      {quoteModalOpen && selectedBookingForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#171717]">Custom Itinerary & Price Proposal</h3>
                  <p className="text-xs text-slate-500">For {selectedBookingForQuote.touristName} · {selectedBookingForQuote.bookingReference}</p>
                </div>
              </div>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Detailed Itinerary & Inclusions
                </label>
                <textarea
                  rows={6}
                  value={customItinerary}
                  onChange={(e) => setCustomItinerary(e.target.value)}
                  placeholder="Outline the sequence of activities, meeting point, cultural sites, and inclusions..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-indigo-600 outline-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                  Total Custom Quote (₹ INR)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#171717] focus:border-indigo-600 outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Covers guide fees, workshop supplies, and associated local host services.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingQuote ? 'Submitting...' : 'Send Proposal to Tourist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedBookingForReject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#171717]">Decline Booking Request</h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Declining (sent to tourist):
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  {submittingReject ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
