'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  CreditCard,
  PhoneCall,
  Star,
  Sparkles,
  AlertTriangle,
  FileText,
  Loader2,
  Check,
  ArrowRight,
  MessageSquare,
  ExternalLink,
  Send,
  Navigation,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getMyExperienceBookings,
  confirmBookingPayment,
  selectCashPayment,
  checkinCheckpoint,
  triggerSosAlert,
  confirmTripCompletion,
  submitExperienceReview,
  raiseBookingDispute,
  getBookingMessages,
  sendBookingMessage,
  ExperienceBooking,
  BookingMessage
} from '@/lib/api';

export default function BookingsHubPage() {
  const { user, token, requireAuth } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Modals State
  const [activePaymentBooking, setActivePaymentBooking] = useState<ExperienceBooking | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [activeSosBooking, setActiveSosBooking] = useState<ExperienceBooking | null>(null);
  const [sosDetails, setSosDetails] = useState<string>('');
  const [sosSuccess, setSosSuccess] = useState<boolean>(false);

  // Trip Chat State
  const [activeChatBooking, setActiveChatBooking] = useState<ExperienceBooking | null>(null);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [newMessageText, setNewMessageText] = useState<string>('');

  const [activeReviewBooking, setActiveReviewBooking] = useState<ExperienceBooking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');

  const [activeDisputeBooking, setActiveDisputeBooking] = useState<ExperienceBooking | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('Guide no-show / delay');
  const [disputeDetails, setDisputeDetails] = useState<string>('');

  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMyExperienceBookings(token);
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      requireAuth('/bookings');
      return;
    }
    loadBookings();
  }, [user, requireAuth, loadBookings]);

  const loadMessages = useCallback(async (bookingId: string) => {
    if (!token) return;
    setChatLoading(true);
    try {
      const res = await getBookingMessages(bookingId, token);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err: unknown) {
      console.error('Failed to load trip messages:', err);
    } finally {
      setChatLoading(false);
    }
  }, [token]);

  const openChat = (booking: ExperienceBooking) => {
    setActiveChatBooking(booking);
    setNewMessageText('');
    loadMessages(booking.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeChatBooking || !newMessageText.trim()) return;
    setSendingMessage(true);
    try {
      const res = await sendBookingMessage(activeChatBooking.id, newMessageText.trim(), token);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        setNewMessageText('');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Payment Handler (Task 14 - Razorpay simulated / verified)
  const handleConfirmPayment = async (booking: ExperienceBooking) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
      const paymentId = `pay_${Math.random().toString(36).substring(2, 10)}`;
      const signature = `sig_verified_${Date.now()}`;

      await confirmBookingPayment(
        booking.id,
        {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
        token
      );
      setActivePaymentBooking(null);
      await loadBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Payment confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectCashPayment = async (booking: ExperienceBooking) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await selectCashPayment(booking.id, token);
      setActivePaymentBooking(null);
      await loadBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to select cash payment');
    } finally {
      setActionLoading(false);
    }
  };

  // Check-in Handler (Task 16 - Safety Checkpoints)
  const handleCheckin = async (bookingId: string, checkpointId: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await checkinCheckpoint(
        bookingId,
        {
          checkpointId,
          latitude: 17.385,
          longitude: 78.4867,
          notes: 'Checked in by traveler at scheduled waypoint.',
        },
        token
      );
      await loadBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  // SOS Emergency Trigger (Task 16)
  const handleTriggerSos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeSosBooking) return;
    setActionLoading(true);
    try {
      await triggerSosAlert(
        activeSosBooking.id,
        {
          details: sosDetails || 'Tourist activated emergency SOS from trip dashboard.',
          latitude: 17.385,
          longitude: 78.4867,
        },
        token
      );
      setSosSuccess(true);
      setTimeout(() => {
        setSosSuccess(false);
        setActiveSosBooking(null);
      }, 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to trigger SOS alert');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Trip Completion (Task 15)
  const handleConfirmCompletion = async (bookingId: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await confirmTripCompletion(bookingId, token);
      await loadBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to confirm completion');
    } finally {
      setActionLoading(false);
    }
  };

  // Review Submit (Task 17)
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeReviewBooking) return;
    setActionLoading(true);
    try {
      await submitExperienceReview(
        activeReviewBooking.id,
        {
          rating: reviewRating,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim(),
        },
        token
      );
      setActiveReviewBooking(null);
      setReviewComment('');
      await loadBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  // Dispute Submit (Task 18)
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeDisputeBooking) return;
    setActionLoading(true);
    try {
      await raiseBookingDispute(
        activeDisputeBooking.id,
        {
          reason: disputeReason,
          details: disputeDetails.trim(),
        },
        token
      );
      setActiveDisputeBooking(null);
      setDisputeDetails('');
      await loadBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to raise dispute');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold">Request Pending Host</span>;
      case 'ACCEPTED':
      case 'PAYMENT_PENDING':
        return <span className="bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-full text-xs font-bold">Payment Required</span>;
      case 'CONFIRMED':
        return <span className="bg-teal-100 text-teal-900 px-2.5 py-1 rounded-full text-xs font-bold">Confirmed • Scheduled</span>;
      case 'TRIP_STARTED':
      case 'IN_PROGRESS':
        return <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">Live Trip In-Progress</span>;
      case 'COMPLETION_PENDING':
        return <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full text-xs font-bold">Pending Your Confirmation</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-900 px-2.5 py-1 rounded-full text-xs font-bold">Trip Completed</span>;
      case 'REVIEWED':
        return <span className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full text-xs font-bold">Verified &amp; Reviewed</span>;
      case 'DISPUTED':
        return <span className="bg-rose-100 text-rose-900 px-2.5 py-1 rounded-full text-xs font-bold">Under Administrative Review</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="bg-stone-200 text-stone-700 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Header */}
      <section className="bg-stone-900 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-3 border border-amber-500/20">
                <Compass className="w-3.5 h-3.5" />
                Tourist Experience Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                My Bookings, Trips &amp; Safety Live Center
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-300">
                Real-time booking status, secure Razorpay checkout, live checkpoint check-ins, and 24/7 SOS safety assistance.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center self-start sm:self-auto rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 transition shadow-sm"
            >
              Explore More Places
            </Link>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {loading && (
          <div className="text-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs font-semibold text-stone-500">Loading your booked experiences and live trips...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl bg-red-50 p-6 border border-red-200 text-center">
            <p className="text-sm font-bold text-red-800">{error}</p>
            <button
              onClick={loadBookings}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-stone-400 mx-auto" />
            <h2 className="text-lg font-bold text-stone-900">No Active Tour Bookings Found</h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              You haven&apos;t booked a local experience yet. Browse verified guides in Hyderabad, Jaipur, Varanasi, Hampi, and across India!
            </p>
            <Link
              href="/local"
              className="inline-flex items-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow-sm"
            >
              Find a Local Guide
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-8">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border-2 border-stone-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md space-y-6"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-stone-100 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-mono">
                        {booking.bookingReference}
                      </span>
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-stone-400">
                        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-stone-900 pt-1">
                      {booking.experienceTitle || (booking.destinationName ? `${booking.destinationName} Guided Experience` : 'Guided Experience')}
                    </h2>
                    <p className="text-xs text-stone-600 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {booking.destinationName || 'Local Tourism Hub'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Total Amount</span>
                    <p className="text-xl font-black text-stone-900">
                      ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Payment: <strong className={booking.paymentStatus === 'PAID' ? 'text-teal-700' : 'text-amber-700'}>{booking.paymentStatus}</strong>
                    </span>
                  </div>
                </div>

                {/* Guide & Booking Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-stone-50 p-5 rounded-2xl border border-stone-100 text-xs">
                  {/* Guide Info */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-stone-400 uppercase text-[10px]">Primary Host</span>
                    <p className="font-bold text-stone-900 text-sm">{booking.hostName}</p>
                    <p className="text-stone-500">{booking.hostRoleTitle || 'Verified Local Host'}</p>
                    <Link
                      href={`/local/${booking.hostId}`}
                      className="text-amber-800 font-bold hover:underline inline-block mt-1"
                    >
                      View Profile →
                    </Link>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-stone-400 uppercase text-[10px]">Trip Schedule</span>
                    <p className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {booking.bookingDate}
                    </p>
                    <p className="text-stone-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Start: {booking.startTime || '09:00 AM'}
                    </p>
                    <p className="text-stone-600">Guests: <strong>{booking.guestCount}</strong></p>
                  </div>

                  {/* Custom notes or itinerary */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-stone-400 uppercase text-[10px]">Custom Itinerary &amp; Notes</span>
                    <p className="text-stone-700 leading-relaxed line-clamp-3">
                      {booking.customItinerary || booking.customRequirements || 'Standard predefined itinerary.'}
                    </p>
                  </div>
                </div>

                {/* Cash Milestone Tracking Box (Requirement 17, 18) */}
                {booking.paymentMethod === 'CASH' && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 uppercase text-[10px] flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-700" /> Cash Payment Milestone Ledger (Pay Directly to Guide):
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                        Total: ₹{Number(booking.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Milestone 1 */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        booking.cashMilestone1Paid
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-white border-amber-200 text-stone-800'
                      }`}>
                        <div>
                          <p className="font-bold">1st Milestone (50% at Trip Start)</p>
                          <p className="text-[11px] text-stone-500 font-semibold">
                            Amount: ₹{(Number(booking.cashMilestone1Amount || booking.totalAmount / 2)).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          {booking.cashMilestone1Paid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <Check className="w-3 h-3 text-emerald-600" /> Recorded Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                              ⏳ Due at Start
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestone 2 */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        booking.cashMilestone2Paid
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-white border-amber-200 text-stone-800'
                      }`}>
                        <div>
                          <p className="font-bold">2nd Milestone (50% on Completion)</p>
                          <p className="text-[11px] text-stone-500 font-semibold">
                            Amount: ₹{(Number(booking.cashMilestone2Amount || booking.totalAmount / 2)).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          {booking.cashMilestone2Paid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <Check className="w-3 h-3 text-emerald-600" /> Recorded Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-[11px]">
                              ⏳ Due on End
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestone-Based Active Trip Progress Tracker (Requirement 12, 13) */}
                {['CONFIRMED', 'TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'REVIEWED'].includes(booking.status) && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 uppercase text-[10px] flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-teal-700" />
                        Live Trip Progress &amp; Milestone Timeline
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        booking.status === 'COMPLETED' || booking.status === 'REVIEWED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'IN_PROGRESS' || booking.status === 'TRIP_STARTED'
                          ? 'bg-teal-100 text-teal-800 animate-pulse'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {booking.status === 'IN_PROGRESS' || booking.status === 'TRIP_STARTED' ? '● Live In-Progress' : booking.status}
                      </span>
                    </div>

                    {/* Stepper Timeline */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {/* Step 1: Trip Started */}
                      <div className={`p-3 rounded-xl border space-y-1 ${
                        ['TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'REVIEWED'].includes(booking.status)
                          ? 'bg-teal-50/80 border-teal-300 text-teal-950'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold">1. Trip Started</span>
                          {['TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'REVIEWED'].includes(booking.status) ? (
                            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                        <p className="font-bold text-xs">
                          {booking.startTime || '09:00 AM'}
                        </p>
                        <p className="text-[10px] text-stone-500">Guide &amp; Guest Sync</p>
                      </div>

                      {/* Step 2: Meeting Point */}
                      <div className={`p-3 rounded-xl border space-y-1 ${
                        ['TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'REVIEWED'].includes(booking.status)
                          ? 'bg-teal-50/80 border-teal-300 text-teal-950'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold">2. Meeting Point</span>
                          {['TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'REVIEWED'].includes(booking.status) ? (
                            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                        <p className="font-bold text-xs truncate">
                          {booking.meetingPointName || 'Starting Point'}
                        </p>
                        <p className="text-[10px] text-stone-500">Location Verified</p>
                      </div>

                      {/* Step 3: Checkpoints */}
                      <div className={`p-3 rounded-xl border space-y-1 ${
                        booking.checkins && booking.checkins.some(c => c.status === 'COMPLETED')
                          ? 'bg-teal-50/80 border-teal-300 text-teal-950'
                          : ['IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'REVIEWED'].includes(booking.status)
                          ? 'bg-sky-50 border-sky-200 text-sky-950'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold">3. Check-ins</span>
                          {booking.checkins && booking.checkins.every(c => c.status === 'COMPLETED') ? (
                            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          )}
                        </div>
                        <p className="font-bold text-xs">
                          {booking.checkins?.filter(c => c.status === 'COMPLETED').length || 0} of {booking.checkins?.length || 2} Done
                        </p>
                        <p className="text-[10px] text-stone-500">Waypoints Monitored</p>
                      </div>

                      {/* Step 4: Completion */}
                      <div className={`p-3 rounded-xl border space-y-1 ${
                        ['COMPLETED', 'REVIEWED'].includes(booking.status)
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : booking.status === 'COMPLETION_PENDING'
                          ? 'bg-blue-50 border-blue-300 text-blue-950 animate-pulse'
                          : 'bg-stone-50 border-stone-200 text-stone-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold">4. Completion</span>
                          {['COMPLETED', 'REVIEWED'].includes(booking.status) ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Star className="w-3.5 h-3.5 text-stone-400" />
                          )}
                        </div>
                        <p className="font-bold text-xs">
                          {booking.status === 'COMPLETED' || booking.status === 'REVIEWED'
                            ? 'Tour Completed'
                            : booking.status === 'COMPLETION_PENDING'
                            ? 'Pending Your OK'
                            : 'Pending'}
                        </p>
                        <p className="text-[10px] text-stone-500">Review &amp; Rating</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meeting Point & Map Coordinates Card (Requirement 7, 9) */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">Meeting Point:</span>
                        <span className="font-semibold text-amber-900">{booking.meetingPointName || (booking.destinationName ? `${booking.destinationName} Heritage Landmark` : 'Local Meeting Point')}</span>
                      </div>
                      <p className="text-stone-500 mt-0.5">{booking.meetingPointAddress || (booking.destinationName ? `${booking.destinationName}, India` : 'India')}</p>
                      {booking.meetingPointLatitude && booking.meetingPointLongitude && (
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          Coordinates: {booking.meetingPointLatitude.toFixed(4)}° N, {booking.meetingPointLongitude.toFixed(4)}° E
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={
                        booking.meetingPointLatitude && booking.meetingPointLongitude
                          ? `https://www.google.com/maps/search/?api=1&query=${booking.meetingPointLatitude},${booking.meetingPointLongitude}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((booking.meetingPointAddress || booking.destinationName || '') + ' India')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                  </div>
                </div>

                {/* Supporting Providers List (Task 12) */}
                {booking.supportingProviders && booking.supportingProviders.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 text-xs">
                    <span className="font-bold text-amber-900 uppercase text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Coordinated Supporting Providers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {booking.supportingProviders.map((supp) => (
                        <div key={supp.id} className="bg-white p-2.5 rounded-xl border border-amber-200/80 flex items-start gap-2">
                          <div className="p-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {supp.providerType}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{supp.providerName}</p>
                            <p className="text-stone-500 text-[11px]">{supp.roleDescription}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Checkpoints & Safety Hub (Task 15, 16) */}
                {['CONFIRMED', 'TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(booking.status) && (
                  <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/40 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                          Live Safety &amp; Checkpoint Monitor
                        </span>
                        <h3 className="text-base font-bold text-stone-900 mt-1">
                          Hybrid Trip Check-in Progress
                        </h3>
                        <p className="text-[11px] text-teal-800 mt-0.5">
                          💡 Note: Scheduled checkpoints verify safety milestones. Missed check-in will trigger a friendly reminder, not an emergency alert.
                        </p>
                      </div>

                      {/* Emergency SOS Button (Task 16) */}
                      <button
                        onClick={() => {
                          setActiveSosBooking(booking);
                          setSosDetails('');
                        }}
                        className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md self-start sm:self-auto animate-bounce cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Trigger Emergency SOS
                      </button>
                    </div>

                    {/* Checkpoints Grid */}
                    {booking.checkins && booking.checkins.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {booking.checkins.map((cp) => (
                          <div
                            key={cp.id}
                            className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                              cp.status === 'COMPLETED'
                                ? 'bg-white border-teal-300 text-teal-950'
                                : 'bg-white/80 border-stone-200 text-stone-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[10px] uppercase text-stone-400">
                                  {cp.checkpointType}
                                </span>
                                {cp.status === 'COMPLETED' ? (
                                  <span className="inline-flex items-center text-teal-600 font-bold text-[11px]">
                                    <Check className="w-3.5 h-3.5 mr-0.5" /> Checked-In
                                  </span>
                                ) : (
                                  <span className="text-stone-400 font-semibold text-[11px]">Pending</span>
                                )}
                              </div>
                              <p className="font-bold text-stone-900">{cp.checkpointName}</p>
                              <p className="text-[11px] text-stone-500">{cp.notes}</p>
                            </div>

                            {cp.status !== 'COMPLETED' && (
                              <button
                                onClick={() => handleCheckin(booking.id, cp.id)}
                                disabled={actionLoading}
                                className="mt-3 w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 text-xs transition cursor-pointer"
                              >
                                Check-In Here
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Pay Button */}
                    {(booking.status === 'PAYMENT_PENDING' || booking.status === 'ACCEPTED') && (
                      <button
                        onClick={() => setActivePaymentBooking(booking)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2.5 text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay ₹{Number(booking.totalAmount).toLocaleString('en-IN')} (Razorpay)
                      </button>
                    )}

                    {/* Message Guide Button (Requirement 8) */}
                    <button
                      onClick={() => openChat(booking)}
                      className="rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-teal-700" />
                      Message Guide
                    </button>

                    {/* Call Guide Button (Requirement 7 - only when phone is available & trip active) */}
                    {booking.hostPhone && (
                      <a
                        href={`tel:${booking.hostPhone}`}
                        className="rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-700" />
                        Call Guide
                      </a>
                    )}

                    {/* Confirm Completion */}
                    {['IN_PROGRESS', 'COMPLETION_PENDING'].includes(booking.status) && (
                      <button
                        onClick={() => handleConfirmCompletion(booking.id)}
                        disabled={actionLoading}
                        className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm Tour Completed
                      </button>
                    )}

                    {/* Review Button */}
                    {booking.status === 'COMPLETED' && (
                      <button
                        onClick={() => setActiveReviewBooking(booking)}
                        className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-4 h-4 fill-white" />
                        Write Verified Review
                      </button>
                    )}

                    {/* Report Dispute Button */}
                    {!['REVIEWED', 'CANCELLED', 'REJECTED', 'DISPUTED'].includes(booking.status) && (
                      <button
                        onClick={() => setActiveDisputeBooking(booking)}
                        className="rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2 text-xs font-semibold cursor-pointer"
                      >
                        Report Issue / Dispute
                      </button>
                    )}
                  </div>

                  {/* Helpline badge */}
                  <div className="text-[11px] text-stone-400 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                    <span>24/7 Tourism Helpline: <strong>1363</strong> | Emergency: <strong>112</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Modal (Task 14, 17, 18) */}
      {activePaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">Select Payment Method</h3>
              </div>
              <button
                onClick={() => setActivePaymentBooking(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Booking Ref:</span>
                  <strong className="text-stone-900">{activePaymentBooking.bookingReference}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Primary Guide:</span>
                  <strong className="text-stone-900">{activePaymentBooking.hostName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Date &amp; Time:</span>
                  <strong className="text-stone-900">{activePaymentBooking.bookingDate} ({activePaymentBooking.startTime})</strong>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm">
                  <span className="font-bold text-stone-800">Total Amount:</span>
                  <strong className="font-black text-amber-900">
                    ₹{Number(activePaymentBooking.totalAmount).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-stone-800 block text-xs">Choose Payment Option:</label>
                
                {/* Online Option */}
                <div
                  onClick={() => setPaymentMethodChoice('ONLINE')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethodChoice === 'ONLINE'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethodChoice === 'ONLINE'}
                    onChange={() => setPaymentMethodChoice('ONLINE')}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 text-xs">Online Payment (Razorpay / UPI / Cards)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Instant</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Pay total ₹{Number(activePaymentBooking.totalAmount).toLocaleString('en-IN')} securely online with instant confirmation.
                    </p>
                  </div>
                </div>

                {/* Cash Milestone Option */}
                <div
                  onClick={() => setPaymentMethodChoice('CASH')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethodChoice === 'CASH'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethodChoice === 'CASH'}
                    onChange={() => setPaymentMethodChoice('CASH')}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 text-xs">Pay Cash to Guide (Two Milestones)</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Milestone Tracking</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Pay directly to the provider: <strong>50% (₹{(Number(activePaymentBooking.totalAmount) / 2).toLocaleString('en-IN')})</strong> at trip start, and the remaining <strong>50% (₹{(Number(activePaymentBooking.totalAmount) / 2).toLocaleString('en-IN')})</strong> after trip completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {paymentMethodChoice === 'ONLINE' ? (
              <button
                onClick={() => handleConfirmPayment(activePaymentBooking)}
                disabled={actionLoading}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Pay ₹{Number(activePaymentBooking.totalAmount).toLocaleString('en-IN')} via Razorpay
              </button>
            ) : (
              <button
                onClick={() => handleSelectCashPayment(activePaymentBooking)}
                disabled={actionLoading}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm Booking with Cash Milestones
              </button>
            )}
          </div>
        </div>
      )}

      {/* SOS Emergency Modal (Task 16) */}
      {activeSosBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 border-4 border-rose-500">
            {sosSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">SOS Incident Transmitted!</h3>
                <p className="text-xs text-stone-600">
                  Emergency coordinates dispatched to local tourism response units and designated safety contacts.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTriggerSos} className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-black">YatraSetu Emergency SOS</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSosBooking(null)}
                    className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                  <p className="font-bold">Immediate Emergency Helplines:</p>
                  <p>National Emergency Number: <strong className="text-base text-rose-700">112</strong></p>
                  <p>Ministry of Tourism 24/7 Helpline: <strong className="text-base text-rose-700">1363</strong></p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Describe Immediate Situation / Location (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={sosDetails}
                    onChange={(e) => setSosDetails(e.target.value)}
                    placeholder="e.g. Lost in narrow market lanes; immediate transport assistance required."
                    className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black py-3 text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Transmit SOS Alert Now
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Modal (Task 17) */}
      {activeReviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-bold text-stone-900">Verified Trip Review</h3>
              </div>
              <button
                onClick={() => setActiveReviewBooking(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Rating: {reviewRating} Stars
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Outstanding heritage storytelling!"
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Detailed Review
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your tour experience with the guide and supporting local hosts..."
                  className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-xs transition shadow-md"
              >
                Submit Verified Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal (Task 18) */}
      {activeDisputeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold">Report Issue / Raise Dispute</h3>
              </div>
              <button
                onClick={() => setActiveDisputeBooking(null)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Reason for Dispute
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-xs font-medium"
                >
                  <option value="Guide no-show / delay">Guide no-show / delay</option>
                  <option value="Incomplete tour itinerary">Incomplete tour itinerary</option>
                  <option value="Service quality issue">Service quality issue</option>
                  <option value="Safety concern">Safety concern</option>
                  <option value="Other">Other dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Provide Explanation &amp; Evidence
                </label>
                <textarea
                  rows={4}
                  required
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  placeholder="Explain what occurred. This will be examined by YatraSetu administrative arbitration."
                  className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 text-xs transition shadow-md"
              >
                Submit Dispute for Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Trip-Scoped Messaging Modal (Requirement 8) */}
      {activeChatBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col h-[560px] border border-stone-200 animate-scale-up">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm text-white">
                  {activeChatBooking.hostName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    {activeChatBooking.hostName}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-300/20 text-teal-100 border border-teal-200/30">
                      Assigned Guide
                    </span>
                  </h3>
                  <p className="text-[11px] text-teal-100 font-mono">
                    Trip #{activeChatBooking.bookingReference} · {activeChatBooking.destinationName || 'Tour Circuit'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeChatBooking.hostPhone && (
                  <a
                    href={`tel:${activeChatBooking.hostPhone}`}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Call Guide"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setActiveChatBooking(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Trip Info Strip */}
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/60 text-xs flex items-center justify-between text-amber-900">
              <span className="font-semibold truncate">
                📍 {activeChatBooking.meetingPointName || 'Meeting Point'}: {activeChatBooking.meetingPointAddress || activeChatBooking.destinationName}
              </span>
              <span className="shrink-0 text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                {activeChatBooking.bookingDate}
              </span>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full text-stone-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="font-semibold text-stone-600">Start trip coordination with {activeChatBooking.hostName}</p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    Confirm arrival times, meeting landmarks, or special dietary / cultural preferences.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} text-xs space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="font-bold text-[10px] text-stone-500">
                          {isMe ? 'You' : msg.senderName}
                        </span>
                        <span className="text-[9px] text-stone-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed text-xs ${
                          isMe
                            ? 'bg-[#0F766E] text-white rounded-br-xs'
                            : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Composer Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message ${activeChatBooking.hostName}...`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-xs focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessageText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {sendingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
