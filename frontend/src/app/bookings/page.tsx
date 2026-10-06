'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
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
  Building2,
  QrCode,
  Download,
  X,
  Users,
  BedDouble,
  Layers,
  ChevronRight,
  Phone,
  Mail,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getMyExperienceBookings,
  getMyHotelBookings,
  createExperiencePaymentOrder,
  confirmBookingPayment,
  selectCashPayment,
  checkinCheckpoint,
  triggerSosAlert,
  confirmTripCompletion,
  submitExperienceReview,
  raiseBookingDispute,
  getBookingMessages,
  sendBookingMessage,
  createHotelPaymentOrder,
  verifyHotelPayment,
  downloadBookingVoucher,
  submitHotelReview,
  ExperienceBooking,
  BookingMessage,
  HotelBookingDto,
} from '@/lib/api';

type BookingHubTab = 'ALL' | 'ACTIVE' | 'EXPERIENCES' | 'HOTELS' | 'COMPLETED';

export default function BookingsHubPage() {
  const { user, token, loading: authLoading, requireAuth } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<BookingHubTab>('ALL');
  const [experienceBookings, setExperienceBookings] = useState<ExperienceBooking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBookingDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Experience Payment Modal
  const [activePaymentBooking, setActivePaymentBooking] = useState<ExperienceBooking | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<'ONLINE' | 'CASH'>('ONLINE');

  // Hotel Payment Modal
  const [activeHotelPaymentBooking, setActiveHotelPaymentBooking] = useState<HotelBookingDto | null>(null);
  const [hotelPaymentChoice, setHotelPaymentChoice] = useState<'ONLINE' | 'CASH'>('ONLINE');

  // QR Modal for Hotel Check-in
  const [selectedHotelForQr, setSelectedHotelForQr] = useState<HotelBookingDto | null>(null);

  // Voucher Download Loading
  const [downloadingVoucherRef, setDownloadingVoucherRef] = useState<string | null>(null);

  // SOS Emergency Modal
  const [activeSosBooking, setActiveSosBooking] = useState<ExperienceBooking | null>(null);
  const [sosDetails, setSosDetails] = useState<string>('');
  const [sosSuccess, setSosSuccess] = useState<boolean>(false);

  // In-App Trip Chat Modal
  const [activeChatBooking, setActiveChatBooking] = useState<ExperienceBooking | null>(null);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [newMessageText, setNewMessageText] = useState<string>('');

  // Experience Review Modal
  const [activeReviewBooking, setActiveReviewBooking] = useState<ExperienceBooking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');

  // Hotel Review Modal
  const [activeHotelReviewBooking, setActiveHotelReviewBooking] = useState<HotelBookingDto | null>(null);
  const [hotelReviewRating, setHotelReviewRating] = useState<number>(5);
  const [hotelReviewComment, setHotelReviewComment] = useState<string>('');

  // Dispute Modal
  const [activeDisputeBooking, setActiveDisputeBooking] = useState<ExperienceBooking | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('Guide no-show / delay');
  const [disputeDetails, setDisputeDetails] = useState<string>('');

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAllBookings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [expRes, hotelRes] = await Promise.all([
        getMyExperienceBookings(token).catch(() => ({ success: true, data: [] })),
        getMyHotelBookings(token).catch(() => ({ success: true, data: [] })),
      ]);

      if (expRes.success && expRes.data) {
        setExperienceBookings(expRes.data);
      }
      if (hotelRes.success && hotelRes.data) {
        setHotelBookings(hotelRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshAllBookingsSilently = useCallback(async () => {
    if (!token) return;
    try {
      const [expRes, hotelRes] = await Promise.all([
        getMyExperienceBookings(token).catch(() => ({ success: true, data: [] })),
        getMyHotelBookings(token).catch(() => ({ success: true, data: [] })),
      ]);

      if (expRes.success && expRes.data) {
        setExperienceBookings(expRes.data);
      }
      if (hotelRes.success && hotelRes.data) {
        setHotelBookings(hotelRes.data);
      }
    } catch {
      // ignore background refresh errors
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      requireAuth('/bookings');
      return;
    }
    loadAllBookings();

    const interval = setInterval(refreshAllBookingsSilently, 4000);
    const handleFocus = () => refreshAllBookingsSilently();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, authLoading, requireAuth, loadAllBookings, refreshAllBookingsSilently]);

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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as unknown as { Razorpay: unknown }).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Experience Payment Handlers
  const handleConfirmExperienceOnlinePayment = async (booking: ExperienceBooking) => {
    if (!token) return;
    setActionLoading(true);
    try {
      // 1. Generate/Retrieve server-authoritative Razorpay Order
      const orderRes = await createExperiencePaymentOrder(booking.id, token);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Payment initiation failed. Please try again.');
      }
      const orderData = orderRes.data;

      // 2. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Unable to connect to Razorpay payment gateway script. Please check your network connection.');
      }

      // 3. Open Razorpay Checkout (Test/Live Mode)
      const options = {
        key: orderData.keyId || 'rzp_test_yatrasetudemo',
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'YatraSetu Tourism Ecosystem',
        description: `Guide Experience: ${booking.experienceTitle || 'Verified Experience'}`,
        order_id: orderData.providerOrderId?.startsWith('order_exp_') ? undefined : orderData.providerOrderId,
        prefill: {
          name: orderData.guestName || user?.fullName || 'Traveler',
          email: orderData.guestEmail || user?.email || '',
          contact: orderData.guestPhone || user?.phone || '',
        },
        theme: {
          color: '#312E81',
        },
        handler: async function (response: {
          razorpay_order_id?: string;
          razorpay_payment_id: string;
          razorpay_signature?: string;
        }) {
          try {
            setActionLoading(true);
            const verifyRes = await confirmBookingPayment(
              booking.id,
              {
                razorpayOrderId: response.razorpay_order_id || orderData.providerOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || `sig_${Date.now()}`,
              },
              token
            );

            if (verifyRes.success) {
              setActionFeedback({
                type: 'success',
                message: `Payment verified successfully! Booking ${booking.bookingReference} is now CONFIRMED.`,
              });
              setActivePaymentBooking(null);
              await loadAllBookings();
            } else {
              setActionFeedback({
                type: 'error',
                message: verifyRes.message || 'Payment verification failed on server.',
              });
            }
          } catch (err: unknown) {
            setActionFeedback({
              type: 'error',
              message: err instanceof Error ? err.message : 'Payment verification failed.',
            });
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setActionLoading(false);
          },
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Payment initiation failed',
      });
      setActionLoading(false);
    }
  };

  const handleSelectExperienceCashPayment = async (booking: ExperienceBooking) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await selectCashPayment(booking.id, token);
      setActionFeedback({
        type: 'success',
        message: `Cash milestone agreement recorded for ${booking.bookingReference}.`,
      });
      setActivePaymentBooking(null);
      await loadAllBookings();
    } catch (err: unknown) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to select cash payment',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Hotel Payment Handlers
  const handleConfirmHotelPayment = async (booking: HotelBookingDto) => {
    if (!token) return;
    setActionLoading(true);
    try {
      const orderRes = await createHotelPaymentOrder(booking.bookingReference, token);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Hotel payment initiation failed. Please try again.');
      }
      const orderData = orderRes.data;

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Unable to connect to Razorpay payment gateway script. Please check your network connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'YatraSetu Tourism Ecosystem',
        description: `Hotel Reservation: ${booking.hotelName} (${booking.roomTypeName})`,
        order_id: orderData.providerOrderId?.startsWith('order_htl_') ? undefined : orderData.providerOrderId,
        prefill: {
          name: orderData.guestName,
          email: orderData.guestEmail,
          contact: orderData.guestPhone,
        },
        theme: {
          color: '#312E81',
        },
        handler: async function (response: {
          razorpay_order_id?: string;
          razorpay_payment_id: string;
          razorpay_signature?: string;
        }) {
          try {
            setActionLoading(true);
            const verifyRes = await verifyHotelPayment(
              booking.bookingReference,
              {
                razorpayOrderId: response.razorpay_order_id || orderData.providerOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || `sig_htl_${Date.now()}`,
              },
              token
            );

            if (verifyRes.success) {
              setActionFeedback({
                type: 'success',
                message: `Hotel payment verified successfully! Reservation ${booking.bookingReference} is now CONFIRMED.`,
              });
              setActiveHotelPaymentBooking(null);
              await loadAllBookings();
            } else {
              setActionFeedback({
                type: 'error',
                message: verifyRes.message || 'Hotel payment verification failed on server.',
              });
            }
          } catch (err: unknown) {
            setActionFeedback({
              type: 'error',
              message: err instanceof Error ? err.message : 'Hotel payment confirmation failed.',
            });
          } finally {
            setActionLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setActionLoading(false);
          },
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Hotel payment initiation failed',
      });
      setActionLoading(false);
    }
  };

  // Download PDF Voucher for Confirmed Hotel Booking
  const handleDownloadVoucher = async (bookingRef: string) => {
    if (!token) return;
    setDownloadingVoucherRef(bookingRef);
    try {
      const blob = await downloadBookingVoucher(bookingRef, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `YatraSetu-Voucher-${bookingRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to download PDF voucher');
    } finally {
      setDownloadingVoucherRef(null);
    }
  };

  // Check-in Handler (Two-Sided Check-in)
  const handleCheckin = async (bookingId: string, checkpointId: string) => {
    if (!token) return;
    setActionLoading(true);
    try {
      await checkinCheckpoint(
        bookingId,
        {
          checkpointId,
          latitude: 13.6288,
          longitude: 79.4192,
          notes: 'Checked in by traveler at rendezvous waypoint.',
        },
        token
      );
      await loadAllBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  // SOS Emergency Trigger
  const handleTriggerSos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeSosBooking) return;
    setActionLoading(true);
    try {
      await triggerSosAlert(
        activeSosBooking.id,
        {
          details: sosDetails || 'Tourist activated emergency SOS from trip dashboard.',
          latitude: 13.6288,
          longitude: 79.4192,
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

  // Confirm Trip Completion
  const handleConfirmCompletion = async (bookingId: string) => {
    if (!token) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await confirmTripCompletion(bookingId, token);
      if (res.success && res.data) {
        setExperienceBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'COMPLETED' } : b))
        );
        setActionFeedback({
          type: 'success',
          message: 'Experience completed successfully! Thank you for exploring with YatraSetu. You can now leave a verified review.',
        });
      }
      await refreshAllBookingsSilently();
    } catch (err: unknown) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to confirm completion. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Experience Review Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeReviewBooking) return;
    setActionLoading(true);
    setActionFeedback(null);
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
      setExperienceBookings((prev) =>
        prev.map((b) => (b.id === activeReviewBooking.id ? { ...b, status: 'REVIEWED' } : b))
      );
      setActiveReviewBooking(null);
      setReviewComment('');
      setReviewTitle('');
      setActionFeedback({
        type: 'success',
        message: 'Review submitted successfully! Thank you for supporting local heritage guides.',
      });
      await refreshAllBookingsSilently();
    } catch (err: unknown) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to submit review. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Hotel Review Submit
  const handleHotelReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeHotelReviewBooking) return;
    setActionLoading(true);
    try {
      await submitHotelReview(
        activeHotelReviewBooking.bookingReference,
        hotelReviewRating,
        hotelReviewComment.trim(),
        token
      );
      setActiveHotelReviewBooking(null);
      setHotelReviewComment('');
      await loadAllBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit hotel review');
    } finally {
      setActionLoading(false);
    }
  };

  // Dispute Handler
  const handleRaiseDispute = async (e: React.FormEvent) => {
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
      await loadAllBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to raise dispute');
    } finally {
      setActionLoading(false);
    }
  };

  // Derived Filtered Lists
  const activeTripsList = experienceBookings.filter((b) =>
    ['CONFIRMED', 'TRAVELER_CHECKED_IN', 'GUIDE_CHECKED_IN', 'TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(
      b.status
    )
  );

  const activeHotelsList = hotelBookings.filter((b) =>
    ['CONFIRMED', 'CHECKED_IN'].includes(b.bookingStatus)
  );

  const completedTripsList = experienceBookings.filter((b) =>
    ['COMPLETED', 'REVIEWED'].includes(b.status)
  );

  const completedHotelsList = hotelBookings.filter((b) =>
    ['CHECKED_OUT', 'COMPLETED'].includes(b.bookingStatus)
  );

  const totalBookingsCount = experienceBookings.length + hotelBookings.length;
  const totalActiveCount = activeTripsList.length + activeHotelsList.length;

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#171717] pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#0F766E] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SIH Verified Traveler Booking Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              My Bookings &amp; Live Trips
            </h1>
            <p className="text-slate-200 text-sm max-w-2xl">
              Track your authentic local guide tours, verified hotel stays, real-time safety checkpoints, and milestone
              payments across India.
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-amber-300">{totalActiveCount}</div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-white">{totalBookingsCount}</div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Total Stays &amp; Tours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
          {[
            { key: 'ALL', label: 'All Bookings', count: totalBookingsCount, icon: Layers },
            { key: 'ACTIVE', label: 'Active Trips & Stays', count: totalActiveCount, icon: Navigation },
            { key: 'EXPERIENCES', label: 'Guides & Experiences', count: experienceBookings.length, icon: Compass },
            { key: 'HOTELS', label: 'Hotels & Homestays', count: hotelBookings.length, icon: Building2 },
            { key: 'COMPLETED', label: 'Completed & Reviews', count: completedTripsList.length + completedHotelsList.length, icon: Star },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as BookingHubTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#312E81] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading / Error / Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-[#312E81] animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading your reservations and live trips...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Failed to load bookings</span>
            </div>
            <p>{error}</p>
            <button
              onClick={loadAllBookings}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
            >
              Retry
            </button>
          </div>
        ) : totalBookingsCount === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#312E81] flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Bookings Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Discover verified local guides, authentic cultural heritage walks, and verified accommodations across India.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-xl bg-[#312E81] hover:bg-indigo-900 text-white font-bold text-xs shadow-md transition-colors"
              >
                Explore Destinations
              </Link>
              <Link
                href="/hotels"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Find Stays
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. EXPERIENCE BOOKINGS SECTION */}
            {(activeTab === 'ALL' || activeTab === 'EXPERIENCES' || activeTab === 'ACTIVE' || activeTab === 'COMPLETED') && (
              <div className="space-y-4">
                {(activeTab === 'ALL' || activeTab === 'ACTIVE') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#0F766E]" />
                      <h2 className="text-xl font-black text-slate-900">Guide &amp; Cultural Experiences</h2>
                    </div>
                  </div>
                )}

                {(() => {
                  const list =
                    activeTab === 'ACTIVE'
                      ? activeTripsList
                      : activeTab === 'COMPLETED'
                      ? completedTripsList
                      : experienceBookings;

                  if (list.length === 0 && activeTab !== 'ALL') {
                    return (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                        No experiences found in this view.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-6">
                      {list.map((b) => {
                        const isRequested = b.status === 'REQUESTED';
                        const isAccepted = b.status === 'ACCEPTED' || b.status === 'PAYMENT_PENDING';
                        const isConfirmed = b.status === 'CONFIRMED';
                        const isTravelerCheckedIn = b.status === 'TRAVELER_CHECKED_IN';
                        const isGuideCheckedIn = b.status === 'GUIDE_CHECKED_IN';
                        const isLiveTrip =
                          ['TRIP_STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(b.status) ||
                          isTravelerCheckedIn ||
                          isGuideCheckedIn;
                        const isCompleted = b.status === 'COMPLETED' || b.status === 'REVIEWED';
                        const isRejected = b.status === 'REJECTED' || b.status === 'CANCELLED';

                        const startCheckpoint = b.checkins?.find((c) => c.checkpointType === 'START');
                        const midCheckpoint = b.checkins?.find((c) => c.checkpointType === 'MIDPOINT');
                        const completionCheckpoint = b.checkins?.find((c) => c.checkpointType === 'COMPLETION');

                        return (
                          <div
                            key={b.id}
                            className={`rounded-3xl border bg-white shadow-sm overflow-hidden transition-all ${
                              isLiveTrip
                                ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                                : isAccepted
                                ? 'border-amber-300 ring-2 ring-amber-500/20'
                                : 'border-slate-200'
                            }`}
                          >
                            {/* Card Top Header */}
                            <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-black text-[#312E81] bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                                    {b.bookingReference}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium">
                                    Booked on {new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 leading-snug">
                                  {b.experienceTitle}
                                </h3>
                              </div>

                              {/* Status Badges */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {isRequested && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                                    Awaiting Guide Acceptance
                                  </span>
                                )}
                                {isAccepted && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    Accepted • Payment Pending
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    Booking Confirmed
                                  </span>
                                )}
                                {isTravelerCheckedIn && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-900 border border-teal-300 flex items-center gap-1.5">
                                    <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                                    You Checked In • Waiting for Guide
                                  </span>
                                )}
                                {isGuideCheckedIn && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-900 border border-teal-300 flex items-center gap-1.5">
                                    <Navigation className="w-3.5 h-3.5 text-teal-600 animate-bounce" />
                                    Guide Arrived &amp; Checked In
                                  </span>
                                )}
                                {(b.status === 'TRIP_STARTED' || b.status === 'IN_PROGRESS') && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 animate-pulse">
                                    <Navigation className="w-3.5 h-3.5" />
                                    Live Trip In Progress
                                  </span>
                                )}
                                {b.status === 'COMPLETION_PENDING' && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Guide Concluded Tour • Confirm Below
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    Experience Safely Completed
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    Declined / Cancelled
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Body Grid */}
                            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Col 1: Host & Schedule */}
                              <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Guide / Host Details
                                </span>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-black text-lg shadow-sm">
                                    {b.hostName?.charAt(0) || 'G'}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 text-sm">{b.hostName}</div>
                                    <div className="text-xs text-[#0F766E] font-medium">{b.hostRoleTitle || 'Verified Heritage Guide'}</div>
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                      <span>YatraSetu Verified Partner</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Date: <strong>{b.bookingDate}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Start Time: <strong>{b.startTime || '09:00 AM'}</strong> ({b.durationHours || 3} hrs)</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Travelers: <strong>{b.guestCount} Guest(s)</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Col 2: Meeting Point & Navigation */}
                              <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Meeting Point &amp; Rendezvous
                                </span>
                                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-bold text-xs text-slate-900">{b.meetingPointName || 'Designated Meeting Point'}</div>
                                      <div className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                                        {b.meetingPointAddress || b.destinationName || 'Local Landmark, India'}
                                      </div>
                                    </div>
                                  </div>

                                  {b.meetingPointLatitude && b.meetingPointLongitude && (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${b.meetingPointLatitude},${b.meetingPointLongitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 pt-1"
                                    >
                                      <Navigation className="w-3.5 h-3.5" />
                                      <span>Open in Google Maps</span>
                                      <ExternalLink className="w-3 h-3 opacity-60" />
                                    </a>
                                  )}
                                </div>

                                {b.customRequirements && (
                                  <div className="text-xs bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-amber-950">
                                    <span className="font-bold">Your Custom Notes:</span> {b.customRequirements}
                                  </div>
                                )}
                              </div>

                              {/* Col 3: Payment & Quick Actions */}
                              <div className="space-y-3 flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Financial Snapshot
                                  </span>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900 flex items-center">
                                      <IndianRupee className="w-5 h-5" />
                                      {Number(b.totalAmount).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-slate-500">Total Net Fare</span>
                                  </div>

                                  <div className="mt-2 text-xs space-y-1">
                                    <div className="flex justify-between text-slate-600">
                                      <span>Payment Mode:</span>
                                      <strong className="text-slate-900">{b.paymentMethod || 'ONLINE'}</strong>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                      <span>Status:</span>
                                      <span className={`font-extrabold ${b.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {b.paymentStatus}
                                      </span>
                                    </div>

                                    {b.paymentMethod === 'CASH' && (
                                      <div className="mt-2 p-2.5 rounded-xl bg-slate-100 text-[11px] space-y-1 text-slate-700">
                                        <div className="flex justify-between">
                                          <span>Milestone 1 (50% At Start):</span>
                                          <strong>{b.cashMilestone1Paid ? '✓ Recorded' : 'Pending at Start'}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Milestone 2 (50% Concluded):</span>
                                          <strong>{b.cashMilestone2Paid ? '✓ Recorded' : 'Pending at End'}</strong>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-2">
                                  {isAccepted && (
                                    <button
                                      onClick={() => setActivePaymentBooking(b)}
                                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      <span>Pay Now &amp; Confirm Booking</span>
                                    </button>
                                  )}

                                  {(isConfirmed || isGuideCheckedIn) && (
                                    <button
                                      onClick={() => startCheckpoint && handleCheckin(b.id, startCheckpoint.id)}
                                      disabled={actionLoading || isTravelerCheckedIn}
                                      className="w-full py-3 px-4 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-extrabold text-xs shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>{isGuideCheckedIn ? 'Guide is Waiting • Check In Now' : 'Check In with Guide at Meeting Point'}</span>
                                    </button>
                                  )}

                                  <div className="flex items-center gap-2">
                                    {(isConfirmed || isLiveTrip || isCompleted) && (
                                      <button
                                        onClick={() => openChat(b)}
                                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 text-indigo-700" />
                                        <span>Message Guide</span>
                                      </button>
                                    )}

                                    {isLiveTrip && (
                                      <button
                                        onClick={() => {
                                          setActiveSosBooking(b);
                                          setSosDetails('');
                                        }}
                                        className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>SOS</span>
                                      </button>
                                    )}
                                  </div>

                                  {b.status === 'COMPLETION_PENDING' && (
                                    <button
                                      onClick={() => handleConfirmCompletion(b.id)}
                                      disabled={actionLoading}
                                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Confirm Experience Completion</span>
                                    </button>
                                  )}

                                  {isCompleted && b.status !== 'REVIEWED' && (
                                    <button
                                      onClick={() => setActiveReviewBooking(b)}
                                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#312E81] border border-indigo-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                                    >
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                      <span>Review Experience &amp; Guide</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Active Trip Live Safety Console */}
                            {(b.status === 'TRIP_STARTED' || b.status === 'IN_PROGRESS') && (
                              <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-5 text-white border-t border-emerald-800/40 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="font-extrabold text-xs tracking-wider uppercase text-emerald-300">
                                      Active Trip Safety Console
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-300">Continuous Monitoring • SIH Prototype</span>
                                </div>

                                {/* Waypoint Progress Bar */}
                                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/15 space-y-1">
                                    <div className="text-[10px] text-emerald-300 font-bold uppercase">1. Check-in</div>
                                    <div className="text-xs font-extrabold text-white flex items-center justify-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/15 space-y-1">
                                    <div className="text-[10px] text-amber-300 font-bold uppercase">2. Mid-Tour</div>
                                    {midCheckpoint?.status === 'COMPLETED' ? (
                                      <div className="text-xs font-extrabold text-white flex items-center justify-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Checked In
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => midCheckpoint && handleCheckin(b.id, midCheckpoint.id)}
                                        disabled={actionLoading}
                                        className="text-[11px] font-extrabold text-amber-300 hover:text-amber-200 underline"
                                      >
                                        Click to Check-in
                                      </button>
                                    )}
                                  </div>
                                  <div className="rounded-xl bg-white/10 p-2.5 border border-white/15 space-y-1">
                                    <div className="text-[10px] text-slate-300 font-bold uppercase">3. Completion</div>
                                    <div className="text-xs font-medium text-slate-300">At Conclusion</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. HOTEL BOOKINGS SECTION */}
            {(activeTab === 'ALL' || activeTab === 'HOTELS' || activeTab === 'ACTIVE' || activeTab === 'COMPLETED') && (
              <div className="space-y-4 pt-4">
                {(activeTab === 'ALL' || activeTab === 'ACTIVE') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-700" />
                      <h2 className="text-xl font-black text-slate-900">Hotel &amp; Stay Reservations</h2>
                    </div>
                  </div>
                )}

                {(() => {
                  const list =
                    activeTab === 'ACTIVE'
                      ? activeHotelsList
                      : activeTab === 'COMPLETED'
                      ? completedHotelsList
                      : hotelBookings;

                  if (list.length === 0 && activeTab !== 'ALL') {
                    return (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                        No hotel reservations found in this view.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-6">
                      {list.map((hb) => {
                        const isRequested = hb.bookingStatus === 'REQUESTED';
                        const isAccepted = hb.bookingStatus === 'ACCEPTED' || hb.bookingStatus === 'PENDING_PAYMENT';
                        const isConfirmed = hb.bookingStatus === 'CONFIRMED';
                        const isCheckedIn = hb.bookingStatus === 'CHECKED_IN';
                        const isCheckedOut = hb.bookingStatus === 'CHECKED_OUT' || hb.bookingStatus === 'COMPLETED';
                        const isCancelled = hb.bookingStatus === 'CANCELLED' || hb.bookingStatus === 'REJECTED';

                        return (
                          <div
                            key={hb.id}
                            className={`rounded-3xl border bg-white shadow-sm overflow-hidden transition-all ${
                              isCheckedIn
                                ? 'border-indigo-300 ring-2 ring-indigo-500/20'
                                : isConfirmed
                                ? 'border-emerald-300'
                                : 'border-slate-200'
                            }`}
                          >
                            {/* Card Top Header */}
                            <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                                    {hb.bookingReference}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium">
                                    Hotel Reservation
                                  </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 leading-snug">
                                  {hb.hotelName}
                                </h3>
                              </div>

                              {/* Status Badges */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {isRequested && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                                    Awaiting Property Confirmation
                                  </span>
                                )}
                                {isAccepted && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    Accepted by Hotel • Payment Pending
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    Reservation Confirmed • QR Ready
                                  </span>
                                )}
                                {isCheckedIn && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-sm flex items-center gap-1.5 animate-pulse">
                                    <BedDouble className="w-3.5 h-3.5" />
                                    Checked In at Reception
                                  </span>
                                )}
                                {isCheckedOut && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    Stay Completed
                                  </span>
                                )}
                                {isCancelled && (
                                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    Declined / Cancelled
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Col 1: Room & Stay */}
                              <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Room &amp; Rate Plan
                                </span>
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm">{hb.roomTypeName}</div>
                                  <div className="text-xs text-indigo-700 font-medium">
                                    {hb.ratePlanName} ({hb.mealPlan || 'CP - Breakfast Included'})
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Check-in: <strong>{hb.checkIn}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Check-out: <strong>{hb.checkOut}</strong></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Occupancy: <strong>{hb.numberOfRooms} Room(s) · {hb.numberOfNights} Night(s)</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Col 2: Property Location & Contact */}
                              <div className="space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Property Details
                                </span>
                                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-bold text-slate-900">{hb.hotelName}</div>
                                      <div className="text-[11px] text-slate-600 leading-relaxed">
                                        Near Tirupati Heritage Corridor, Andhra Pradesh
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                                    <span>Guest: <strong>{hb.guestName}</strong></span>
                                    <span>Status: <strong>{hb.paymentStatus}</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Col 3: Price & Actions */}
                              <div className="space-y-3 flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Total Amount
                                  </span>
                                  <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900 flex items-center">
                                      <IndianRupee className="w-5 h-5" />
                                      {Number(hb.totalAmount).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-slate-500">All Taxes Included</span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2 pt-2">
                                  {isAccepted && (
                                    <button
                                      onClick={() => setActiveHotelPaymentBooking(hb)}
                                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      <span>Pay Now &amp; Confirm Stay</span>
                                    </button>
                                  )}

                                  {(isConfirmed || isCheckedIn) && (
                                    <button
                                      onClick={() => setSelectedHotelForQr(hb)}
                                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                                    >
                                      <QrCode className="w-4 h-4" />
                                      <span>Show Check-in QR Pass</span>
                                    </button>
                                  )}

                                  {isConfirmed && (
                                    <button
                                      onClick={() => handleDownloadVoucher(hb.bookingReference)}
                                      disabled={downloadingVoucherRef === hb.bookingReference}
                                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                    >
                                      <Download className="w-3.5 h-3.5 text-teal-700" />
                                      <span>{downloadingVoucherRef === hb.bookingReference ? 'Generating PDF...' : 'Download Stay Voucher (PDF)'}</span>
                                    </button>
                                  )}

                                  {isCheckedOut && (
                                    <button
                                      onClick={() => setActiveHotelReviewBooking(hb)}
                                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#312E81] border border-indigo-200 font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                                    >
                                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                      <span>Review Hotel Stay</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* 1. Experience Payment Modal */}
      {activePaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  Step 2: Payment &amp; Milestone Agreement
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Complete Booking Payment</h3>
                <p className="text-xs text-slate-500">Booking Reference: {activePaymentBooking.bookingReference}</p>
              </div>
              <button
                onClick={() => setActivePaymentBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Booking Summary Box */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{activePaymentBooking.experienceTitle}</span>
                <span className="text-base text-[#312E81]">₹{Number(activePaymentBooking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Guide: {activePaymentBooking.hostName}</span>
                <span>Date: {activePaymentBooking.bookingDate}</span>
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900">Select Payment Method:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice('ONLINE')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    paymentMethodChoice === 'ONLINE'
                      ? 'border-[#312E81] bg-indigo-50/70 ring-2 ring-[#312E81]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-5 h-5 text-[#312E81]" />
                    {paymentMethodChoice === 'ONLINE' && <CheckCircle className="w-4 h-4 text-[#312E81]" />}
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">UPI / Razorpay</div>
                  <div className="text-[10px] text-slate-500">Instant digital checkout &amp; verification</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice('CASH')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    paymentMethodChoice === 'CASH'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IndianRupee className="w-5 h-5 text-[#0F766E]" />
                    {paymentMethodChoice === 'CASH' && <CheckCircle className="w-4 h-4 text-[#0F766E]" />}
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">Pay by Cash</div>
                  <div className="text-[10px] text-slate-500">Two 50% recorded cash milestones</div>
                </button>
              </div>
            </div>

            {paymentMethodChoice === 'CASH' && (
              <div className="rounded-2xl bg-teal-50 p-3.5 border border-teal-200 text-xs text-teal-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-700" />
                  <span>Milestone Cash Protocol:</span>
                </div>
                <p className="text-[11px] text-teal-900/90 leading-relaxed">
                  50% (₹{(Number(activePaymentBooking.totalAmount) / 2).toFixed(2)}) is handed to your guide at trip start
                  and recorded. The remaining 50% is handed upon successful completion.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActivePaymentBooking(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  paymentMethodChoice === 'ONLINE'
                    ? handleConfirmExperienceOnlinePayment(activePaymentBooking)
                    : handleSelectExperienceCashPayment(activePaymentBooking)
                }
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-[#312E81] hover:bg-indigo-900 text-white font-extrabold text-xs shadow-lg shadow-indigo-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {paymentMethodChoice === 'ONLINE' ? 'Pay Securely with Razorpay / UPI' : 'Confirm Cash Milestones'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hotel Payment Modal */}
      {activeHotelPaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  Hotel Stay Payment
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Confirm Hotel Reservation</h3>
                <p className="text-xs text-slate-500">Ref: {activeHotelPaymentBooking.bookingReference}</p>
              </div>
              <button
                onClick={() => setActiveHotelPaymentBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{activeHotelPaymentBooking.hotelName}</span>
                <span className="text-base text-indigo-700">₹{Number(activeHotelPaymentBooking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                {activeHotelPaymentBooking.roomTypeName} · {activeHotelPaymentBooking.numberOfNights} Night(s) ({activeHotelPaymentBooking.checkIn} to {activeHotelPaymentBooking.checkOut})
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900">Payment Option:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHotelPaymentChoice('ONLINE')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    hotelPaymentChoice === 'ONLINE'
                      ? 'border-[#312E81] bg-indigo-50/70 ring-2 ring-[#312E81]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#312E81]" />
                  <div className="font-extrabold text-xs text-slate-900">Razorpay / UPI</div>
                  <div className="text-[10px] text-slate-500">Prepaid voucher &amp; QR</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHotelPaymentChoice('CASH')}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    hotelPaymentChoice === 'CASH'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <IndianRupee className="w-5 h-5 text-[#0F766E]" />
                  <div className="font-extrabold text-xs text-slate-900">Pay at Hotel</div>
                  <div className="text-[10px] text-slate-500">Settled upon physical arrival</div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveHotelPaymentBooking(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmHotelPayment(activeHotelPaymentBooking)}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-[#312E81] hover:bg-indigo-900 text-white font-extrabold text-xs shadow-lg shadow-indigo-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirm &amp; Generate Check-in QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hotel Check-in QR Modal */}
      {selectedHotelForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Official Check-in Pass
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Hotel Reception QR Pass</h3>
              </div>
              <button
                onClick={() => setSelectedHotelForQr(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Display */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-inner flex flex-col items-center justify-center gap-3">
              <QRCodeSVG
                value={selectedHotelForQr.qrToken || selectedHotelForQr.bookingReference}
                size={220}
                level="H"
                includeMargin={true}
              />
              <div className="font-mono font-black text-xs text-slate-900 tracking-wider">
                PASS: {selectedHotelForQr.bookingReference}
              </div>
            </div>

            {/* Property Summary */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-1">
              <div className="font-extrabold text-slate-900">{selectedHotelForQr.hotelName}</div>
              <div className="text-slate-600 text-[11px]">{selectedHotelForQr.roomTypeName} ({selectedHotelForQr.ratePlanName})</div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Check-in: <strong>{selectedHotelForQr.checkIn}</strong></span>
                <span>Guest: <strong>{selectedHotelForQr.guestName}</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Present this QR code to the front desk reception upon arrival.</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHotelForQr(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 4. SOS Emergency Modal */}
      {activeSosBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-rose-200 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-900">Trip Emergency SOS</h3>
                  <p className="text-[11px] text-rose-700">Immediate Safety Escalation Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSosBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sosSuccess ? (
              <div className="p-6 text-center space-y-2 bg-rose-50 rounded-2xl border border-rose-200">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-slate-900">SOS Incident Transmitted</h4>
                <p className="text-xs text-slate-600">
                  Your safety incident has been registered with GPS coordinates and emergency contacts have been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTriggerSos} className="space-y-4 text-xs">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-[11px] leading-relaxed">
                  <strong>Active Tour:</strong> {activeSosBooking.experienceTitle} with guide {activeSosBooking.hostName}.
                  Coordinates will be dispatched immediately.
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900">Emergency Details (Optional):</label>
                  <textarea
                    value={sosDetails}
                    onChange={(e) => setSosDetails(e.target.value)}
                    placeholder="Describe your immediate situation or medical need..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSosBooking(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>Trigger Emergency SOS</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. In-App Trip Messaging Modal */}
      {activeChatBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col h-[560px] overflow-hidden animate-scaleUp">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-black text-sm">
                  {activeChatBooking.hostName?.charAt(0) || 'G'}
                </div>
                <div>
                  <div className="font-extrabold text-sm">{activeChatBooking.hostName}</div>
                  <div className="text-[11px] text-teal-300">Guide · Ref: {activeChatBooking.bookingReference}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveChatBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
              {chatLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading conversation...</div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center space-y-1">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">Trip Messaging Channel</div>
                  <div className="text-[11px] text-slate-400">Coordinate meeting point, arrival timing, and questions.</div>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                          isMe
                            ? 'bg-[#312E81] text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{m.senderName}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type a message to your guide..."
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#312E81] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessageText.trim()}
                className="p-2.5 rounded-xl bg-[#312E81] hover:bg-indigo-900 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Experience Review Modal */}
      {activeReviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Review Your Experience</h3>
                <p className="text-xs text-slate-500">{activeReviewBooking.experienceTitle}</p>
              </div>
              <button
                onClick={() => setActiveReviewBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Rating Stars */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Your Rating:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 text-2xl focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-2">{reviewRating} / 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Headline / Title:</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unforgettable temple heritage walk!"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-[#312E81] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Your Feedback:</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the storytelling, guide knowledge, punctuality, and cultural depth..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-[#312E81] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveReviewBooking(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !reviewComment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#312E81] hover:bg-indigo-900 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Hotel Review Modal */}
      {activeHotelReviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Review Hotel Stay</h3>
                <p className="text-xs text-slate-500">{activeHotelReviewBooking.hotelName}</p>
              </div>
              <button
                onClick={() => setActiveHotelReviewBooking(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHotelReviewSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Your Rating:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setHotelReviewRating(s)}
                      className="p-1 text-2xl focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= hotelReviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-2">{hotelReviewRating} / 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">Your Stay Review:</label>
                <textarea
                  value={hotelReviewComment}
                  onChange={(e) => setHotelReviewComment(e.target.value)}
                  placeholder="Share details about room cleanliness, reception check-in, hospitality, amenities, and breakfast..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-[#312E81] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveHotelReviewBooking(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !hotelReviewComment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Stay Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
