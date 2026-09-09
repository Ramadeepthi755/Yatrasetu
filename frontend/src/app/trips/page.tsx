'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getMyTrips,
  deleteTrip,
  getMyHotelBookings,
  cancelHotelBooking,
  createHotelPaymentOrder,
  verifyHotelPayment,
  downloadBookingVoucher,
  TripDto,
  HotelBookingDto,
} from '@/lib/api';
import {
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Users,
  Wallet,
  Sparkles,
  Route,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  Building2,
  BedDouble,
  IndianRupee,
  ShieldCheck,
  X,
  XCircle,
  AlertTriangle,
  FileText,
  CreditCard,
  CheckCircle,
  Download,
} from 'lucide-react';

export default function MyTripsPage() {
  const { token, isAuthenticated, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'ITINERARIES' | 'HOTEL_BOOKINGS'>('ITINERARIES');
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBookingDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment Processing State
  const [payingBookingRef, setPayingBookingRef] = useState<string | null>(null);

  // Voucher Download State
  const [downloadingVoucherRef, setDownloadingVoucherRef] = useState<string | null>(null);

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

  // Cancellation Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<HotelBookingDto | null>(null);
  const [cancelReasonCode, setCancelReasonCode] = useState<string>('CHANGED_PLANS');
  const [cancelCustomReason, setCancelCustomReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          getMyTrips(token).catch(() => ({ success: true, data: [] })),
          getMyHotelBookings(token).catch(() => ({ success: true, data: [] })),
        ]);

        if (tripsRes.success && tripsRes.data) {
          setTrips(tripsRes.data);
          if (tripsRes.data.length > 0) {
            setSelectedTrip(tripsRes.data[0]);
          }
        }
        if (bookingsRes.success && bookingsRes.data) {
          setHotelBookings(bookingsRes.data);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load your trips and bookings');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, token]);

  const handleOpenCancelModal = (booking: HotelBookingDto) => {
    setCancelModalBooking(booking);
    setCancelReasonCode('CHANGED_PLANS');
    setCancelCustomReason('');
  };

  const handleCloseCancelModal = () => {
    setCancelModalBooking(null);
    setCancelCustomReason('');
  };

  const handleConfirmCancel = async () => {
    if (!token || !cancelModalBooking) return;

    setIsSubmittingCancel(true);
    try {
      const reasonLabel =
        cancelReasonCode === 'CHANGED_PLANS'
          ? 'Change in travel plans'
          : cancelReasonCode === 'FOUND_BETTER_PRICE'
          ? 'Found alternate accommodation'
          : cancelReasonCode === 'DATES_INCORRECT'
          ? 'Incorrect dates or room configuration'
          : cancelReasonCode === 'TRAVELER_REQUEST'
          ? 'Personal reasons'
          : cancelCustomReason.trim() || 'Other traveler request';

      const finalReason = cancelCustomReason.trim()
        ? `${reasonLabel}: ${cancelCustomReason.trim()}`
        : reasonLabel;

      const res = await cancelHotelBooking(
        cancelModalBooking.bookingReference,
        { reason: finalReason, reasonCode: cancelReasonCode },
        token
      );

      if (res.success && res.data) {
        setHotelBookings((prev) =>
          prev.map((b) =>
            b.bookingReference === cancelModalBooking.bookingReference ? res.data! : b
          )
        );
        handleCloseCancelModal();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel reservation');
    } finally {
      setIsSubmittingCancel(false);
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

  const handlePayNow = async (booking: HotelBookingDto) => {
    if (!token) {
      openAuthModal('TRAVELER');
      return;
    }

    setPayingBookingRef(booking.bookingReference);
    try {
      // 1. Generate/Retrieve server-authoritative Razorpay Order
      const orderRes = await createHotelPaymentOrder(booking.bookingReference, token);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Payment initiation failed. Please try again.');
      }

      const orderData = orderRes.data;

      // 2. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Unable to connect to Razorpay payment gateway script. Please check your network connection.');
      }

      // 3. Open Razorpay Checkout (Test Mode)
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: 'YatraSetu Tourism Ecosystem',
        description: `Hotel Reservation: ${booking.hotelName} (${booking.roomTypeName})`,
        order_id: orderData.providerOrderId,
        prefill: {
          name: orderData.guestName,
          email: orderData.guestEmail,
          contact: orderData.guestPhone,
        },
        theme: {
          color: '#312E81', // Indigo-900 brand color
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 4. Server-Side Cryptographic Signature Verification
            const verifyRes = await verifyHotelPayment(
              booking.bookingReference,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              token
            );

            if (verifyRes.success && verifyRes.data) {
              setHotelBookings((prev) =>
                prev.map((b) =>
                  b.bookingReference === booking.bookingReference ? verifyRes.data! : b
                )
              );
              alert('Payment verified successfully! Your booking is now CONFIRMED.');
            } else {
              alert(verifyRes.message || 'Payment verification failed on server.');
            }
          } catch (verifyErr: unknown) {
            alert(verifyErr instanceof Error ? verifyErr.message : 'Server signature verification error.');
          } finally {
            setPayingBookingRef(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingBookingRef(null);
          },
        },
      };

      const RazorpayConstructor = (window as unknown as {
        Razorpay: new (opts: typeof options) => {
          on: (evt: string, cb: (resp: { error?: { description?: string } }) => void) => void;
          open: () => void;
        };
      }).Razorpay;

      const rzp = new RazorpayConstructor(options);
      rzp.on('payment.failed', function (resp: { error?: { description?: string } }) {
        alert(`Payment failed: ${resp.error?.description || 'Transaction unsuccessful'}`);
        setPayingBookingRef(null);
      });
      rzp.open();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start payment checkout');
      setPayingBookingRef(null);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;

    try {
      await deleteTrip(tripId, token);
      const updated = trips.filter((t) => t.id !== tripId);
      setTrips(updated);
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(updated.length > 0 ? updated[0] : null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete trip');
    }
  };

  // Unauthenticated Guest View
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#FFFBF5] dark:bg-gray-950">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800 shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Saved Trips
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sign in with your YatraSetu account to view your saved itineraries, budget summaries, and custom smart travel plans.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('TRAVELER')}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow transition-all"
          >
            <span>Sign In to Access Trips</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
              <Route className="w-3.5 h-3.5" />
              <span>Traveler Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Saved Trips & Bookings
            </h1>
            <p className="text-xs text-gray-500">
              Personal itineraries and live room reservations with database verification.
            </p>
          </div>

          <Link
            href="/plan-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('ITINERARIES')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ITINERARIES'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Smart Itineraries ({trips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HOTEL_BOOKINGS')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'HOTEL_BOOKINGS'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-indigo-900/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hotel Reservations ({hotelBookings.length})</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* HOTEL RESERVATIONS VIEW */}
        {activeTab === 'HOTEL_BOOKINGS' ? (
          isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-gray-500">Loading your hotel reservations...</p>
            </div>
          ) : hotelBookings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No hotel reservations yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Browse verified partner hotels and reserve rooms with date-specific inventory guarantees!
                </p>
              </div>
              <Link
                href="/hotels"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <BedDouble className="w-4 h-4" />
                <span>Explore Hotels</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotelBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between space-y-5 transition hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Reference & Status Badges */}
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Booking Ref</span>
                        <div className="font-mono font-black text-xs text-gray-900 dark:text-white">
                          {b.bookingReference}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          b.bookingStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          b.bookingStatus === 'PENDING_PAYMENT' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          b.bookingStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          b.bookingStatus === 'EXPIRED' ? 'bg-stone-100 text-stone-700 border-stone-300' :
                          'bg-stone-100 text-stone-700 border-stone-200'
                        }`}>
                          {b.bookingStatus === 'PENDING_PAYMENT' ? 'PENDING PAYMENT' : b.bookingStatus}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Hotel & Room Title */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {b.hotelName}
                      </h4>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {b.roomTypeName}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Plan: {b.ratePlanName} · {b.mealPlan || 'EP'}
                      </p>
                    </div>

                    {/* Stay Dates */}
                    <div className="rounded-2xl bg-stone-50 dark:bg-gray-800/60 p-3.5 border border-stone-100 dark:border-gray-800 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{b.checkIn} → {b.checkOut} ({b.numberOfNights} Nights)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <BedDouble className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{b.numberOfRooms} Room(s) · {b.adults} Adult(s)</span>
                      </div>
                    </div>

                    {/* Status & Lifecycle Explanations */}
                    {b.bookingStatus === 'CONFIRMED' && b.paymentStatus === 'PAID' && (
                      <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 text-[11px] text-emerald-900 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Booking Confirmed · Payment Verified</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 leading-tight">
                          Payment verified securely via Razorpay. Your room is confirmed with the property.
                        </p>
                      </div>
                    )}

                    {b.bookingStatus === 'PENDING_PAYMENT' && (
                      <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-2.5 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>Payment Pending · Unpaid Reservation</span>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-tight">
                          Inventory is temporarily held. Complete payment via Razorpay Sandbox to confirm your stay.
                        </p>
                      </div>
                    )}

                    {b.bookingStatus === 'EXPIRED' && (
                      <div className="rounded-xl bg-stone-100 border border-stone-200 p-2.5 text-[11px] text-stone-700 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-stone-500 shrink-0" />
                          <span>Reservation Expired</span>
                        </div>
                        <p className="text-[10px] text-stone-500 leading-tight">
                          No inventory remains reserved. You may search and reserve again.
                        </p>
                      </div>
                    )}

                    {b.bookingStatus === 'CANCELLED' && (
                      <div className="rounded-xl bg-rose-50/70 border border-rose-200 p-2.5 text-[11px] text-rose-900 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-700 shrink-0" />
                          <span>Reservation Cancelled</span>
                        </div>
                        {b.cancellationReason && (
                          <p className="text-[10px] text-rose-800 font-medium">
                            {b.cancellationReason}
                          </p>
                        )}
                        <p className="text-[9px] text-rose-600 leading-tight">
                          * Note: Automated refund processing is recorded as UNPROCESSED pending financial reconciliation.
                        </p>
                      </div>
                    )}

                    {/* Price Snapshot */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-500">Total Snapshot:</span>
                        <span className="text-base font-black text-gray-900 dark:text-white flex items-center">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {Number(b.totalAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        * {b.pricingDisclosure || 'Applicable taxes/fees are not currently configured/included.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/hotels/${b.hotelId}`}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition"
                      >
                        View Hotel →
                      </Link>

                      {b.bookingStatus === 'CONFIRMED' && b.paymentStatus === 'PAID' && (
                        <Link
                          href={`/bookings/${b.bookingReference}/confirmation`}
                          className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
                        >
                          View Confirmation
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {b.bookingStatus === 'CONFIRMED' && b.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleDownloadVoucher(b.bookingReference)}
                          disabled={downloadingVoucherRef === b.bookingReference}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50"
                        >
                          {downloadingVoucherRef === b.bookingReference ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Voucher</span>
                            </>
                          )}
                        </button>
                      )}

                      {b.bookingStatus === 'PENDING_PAYMENT' && b.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => handlePayNow(b)}
                          disabled={payingBookingRef === b.bookingReference}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50"
                        >
                          {payingBookingRef === b.bookingReference ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Opening...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{b.paymentStatus === 'FAILED' ? 'Retry Payment' : 'Pay Now'}</span>
                            </>
                          )}
                        </button>
                      )}

                      {(b.bookingStatus === 'PENDING_PAYMENT' || b.bookingStatus === 'CONFIRMED') && (
                        <button
                          onClick={() => handleOpenCancelModal(b)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                        >
                          Cancel Reservation
                        </button>
                      )}

                      {b.bookingStatus === 'EXPIRED' && (
                        <Link
                          href="/hotels"
                          className="text-xs font-semibold text-indigo-900 hover:underline"
                        >
                          Search Again
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* SMART ITINERARIES VIEW */
          isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-gray-500">Loading your itineraries...</p>
            </div>
          ) : trips.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No trips planned yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Use the Smart AI Trip Planner to craft your first personalized, day-by-day itinerary!
                </p>
              </div>
              <Link
                href="/plan-trip"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Planning</span>
              </Link>
            </div>
          ) : (
            /* Main Layout: Trips List + Details Pane */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: List of Trips */}
              <div className="space-y-3">
                {trips.map((t) => {
                  const isSelected = selectedTrip?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTrip(t)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-gray-900 border-primary shadow-md ring-2 ring-primary/20'
                          : 'bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{t.destinationName}</span>
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500">
                            <span>{t.totalDays} Days</span>
                            <span>•</span>
                            <span>{t.budgetCategory}</span>
                            <span>•</span>
                            <span>₹{t.totalBudgetInr?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (t.id) handleDeleteTrip(t.id);
                          }}
                          title="Delete Trip"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Selected Trip Details Pane */}
              {selectedTrip && (
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                  {/* Trip Header Banner */}
                  <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedTrip.destinationName} ({selectedTrip.cityName || selectedTrip.stateName})</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        {selectedTrip.status || 'CONFIRMED'}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTrip.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedTrip.totalDays} Days ({selectedTrip.startDate} to {selectedTrip.endDate})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedTrip.travelerCount} Traveler(s)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-primary" />
                        <span>₹{selectedTrip.totalBudgetInr?.toLocaleString('en-IN')} ({selectedTrip.budgetCategory})</span>
                      </div>
                    </div>
                  </div>

                  {/* Day-by-Day View */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Day-by-Day Schedule</span>
                    </h3>

                    <div className="space-y-4">
                      {selectedTrip.itineraries?.map((day) => (
                        <div
                          key={day.dayNumber}
                          className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                              {day.dayNumber}
                            </span>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                              Day {day.dayNumber}: {day.theme}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {day.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-primary uppercase">
                                    {item.timeSlot}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    ~{item.durationHours} hrs
                                  </span>
                                </div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                                  {item.title}
                                </div>
                                {item.rationale && (
                                  <p className="text-[11px] text-gray-500 line-clamp-2">
                                    {item.rationale}
                                  </p>
                                )}
                                <div className="flex items-center justify-between pt-1 text-[10px] text-gray-600 dark:text-gray-400">
                                  <span>Entry: {item.estimatedCostInr && item.estimatedCostInr > 0 ? `₹${item.estimatedCostInr}` : 'Free'}</span>
                                  {item.poiId && (
                                    <span className="font-mono text-[9px] px-1 bg-gray-100 dark:bg-gray-800 rounded">
                                      {item.poiId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination Hub Link */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>All POIs verified in YatraSetu database</span>
                    </div>
                    <Link
                      href={`/destinations/${selectedTrip.destinationId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <span>View Full Destination Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* CANCELLATION MODAL */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-gray-800 space-y-6">
            <div className="flex items-start justify-between border-b border-stone-100 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Cancel Reservation
                </span>
                <h3 className="text-lg font-black text-stone-900 dark:text-white mt-1">
                  {cancelModalBooking.hotelName}
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  Ref: {cancelModalBooking.bookingReference}
                </p>
              </div>
              <button
                onClick={handleCloseCancelModal}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-gray-800 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Inventory Release Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Cancelling this reservation will immediately release your held room units back to public availability.
                </p>
              </div>

              {/* Reason selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 dark:text-stone-200 block">
                  Please select a reason for cancellation:
                </label>
                <select
                  value={cancelReasonCode}
                  onChange={(e) => setCancelReasonCode(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  <option value="CHANGED_PLANS">Change in travel plans / dates</option>
                  <option value="FOUND_BETTER_PRICE">Found alternate accommodation</option>
                  <option value="DATES_INCORRECT">Booked incorrect dates or room type</option>
                  <option value="TRAVELER_REQUEST">Personal / Emergency reasons</option>
                  <option value="OTHER">Other reason</option>
                </select>
              </div>

              {/* Optional remarks */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 dark:text-stone-200 block">
                  Additional remarks (Optional):
                </label>
                <textarea
                  value={cancelCustomReason}
                  onChange={(e) => setCancelCustomReason(e.target.value)}
                  rows={3}
                  maxLength={255}
                  placeholder="Enter any additional details regarding your cancellation..."
                  className="w-full rounded-xl border border-stone-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-xs text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={isSubmittingCancel}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-gray-800 transition"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
