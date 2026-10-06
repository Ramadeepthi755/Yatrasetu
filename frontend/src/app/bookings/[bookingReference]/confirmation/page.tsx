'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getBookingConfirmation,
  downloadBookingVoucher,
  BookingConfirmationDto,
} from '@/lib/api';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  BedDouble,
  Users,
  Building2,
  Download,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Info,
  XCircle,
  RefreshCw,
  FileText,
  CreditCard,
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const bookingReference = params?.bookingReference as string;

  const [confirmation, setConfirmation] = useState<BookingConfirmationDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [isDownloadingVoucher, setIsDownloadingVoucher] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfirmation() {
      if (!bookingReference) return;
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await getBookingConfirmation(bookingReference, token);
        if (res.success && res.data) {
          setConfirmation(res.data);
        } else {
          setErrorMsg(res.message || 'Failed to load booking confirmation');
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Error fetching confirmation data');
      } finally {
        setIsLoading(false);
      }
    }

    loadConfirmation();
  }, [bookingReference, isAuthenticated, token]);

  const handleCopyReference = () => {
    if (!confirmation?.bookingReference) return;
    navigator.clipboard.writeText(confirmation.bookingReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleDownloadVoucher = async () => {
    if (!bookingReference || !token) return;
    setIsDownloadingVoucher(true);
    setVoucherError(null);
    try {
      const blob = await downloadBookingVoucher(bookingReference, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `YatraSetu-Voucher-${bookingReference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      setVoucherError(err instanceof Error ? err.message : 'Failed to download PDF voucher');
    } finally {
      setIsDownloadingVoucher(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Please sign in to view your authoritative booking confirmation snapshot.
          </p>
          <Link
            href="/trips"
            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Go to My Trips
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Retrieving authoritative booking confirmation...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !confirmation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl p-8 border border-red-200 dark:border-red-900/30 text-center shadow-lg">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Confirmation Unavailable</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {errorMsg || 'We could not locate this reservation record.'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm"
            >
              Retry
            </button>
            <Link
              href="/trips"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition text-sm"
            >
              Return to My Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmedAndPaid = confirmation.bookingStatus === 'CONFIRMED' && confirmation.paymentStatus === 'PAID';
  const isCancelled = confirmation.bookingStatus === 'CANCELLED';
  const isExpired = confirmation.bookingStatus === 'EXPIRED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/trips"
            className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Trips
          </Link>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Authoritative Server Snapshot
          </div>
        </div>

        {/* Hero Header Banner */}
        <div className={`rounded-3xl p-8 border shadow-sm ${
          isConfirmedAndPaid
            ? 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/40'
            : isCancelled
            ? 'bg-gradient-to-br from-slate-100 via-rose-50/30 to-white dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 border-slate-200 dark:border-slate-800'
            : isExpired
            ? 'bg-gradient-to-br from-slate-100 via-amber-50/30 to-white dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                {isConfirmedAndPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                    <CheckCircle className="w-3.5 h-3.5" /> Booking Confirmed
                  </span>
                ) : isCancelled ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50">
                    <XCircle className="w-3.5 h-3.5" /> Booking Cancelled
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                    <Clock className="w-3.5 h-3.5" /> Reservation Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                    <Clock className="w-3.5 h-3.5" /> Pending Payment
                  </span>
                )}

                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  confirmation.paymentStatus === 'PAID'
                    ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300'
                    : confirmation.paymentStatus === 'UNPAID'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                }`}>
                  <CreditCard className="w-3 h-3" /> {confirmation.paymentStatus}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isConfirmedAndPaid ? 'Your Reservation is Confirmed!' : `Reservation ${confirmation.bookingReference}`}
              </h1>

              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Confirmation Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {confirmation.bookingReference}
                </span>
                <button
                  onClick={handleCopyReference}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  title="Copy confirmation reference"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {confirmation.voucherAvailable && (
                <button
                  onClick={handleDownloadVoucher}
                  disabled={isDownloadingVoucher}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
                >
                  {isDownloadingVoucher ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Official Voucher
                    </>
                  )}
                </button>
              )}
              <Link
                href={`/hotels/${confirmation.hotelId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition"
              >
                <Building2 className="w-4 h-4" /> Hotel Details
              </Link>
            </div>
          </div>

          {voucherError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{voucherError}</span>
            </div>
          )}
        </div>

        {/* Core Booking Snapshot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stay & Property Details (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {confirmation.hotelName}
                  </h2>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                    <span>
                      {[confirmation.hotelAddress, confirmation.hotelCity, confirmation.hotelState]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                </div>
                {confirmation.hotelStars && (
                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs font-semibold">
                    {confirmation.hotelStars} Star
                  </span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Check-in</span>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {confirmation.checkInDate}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Check-out</span>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {confirmation.checkOutDate}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Duration</span>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {confirmation.nights} {confirmation.nights === 1 ? 'Night' : 'Nights'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <BedDouble className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{confirmation.roomTypeName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {confirmation.numberOfRooms} Room(s) • {confirmation.numberOfGuests} Guest(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Information */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Guest Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Primary Guest: </span>
                    <span className="font-medium text-slate-900 dark:text-white">{confirmation.guestFullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Email: </span>
                    <span className="font-medium text-slate-900 dark:text-white">{confirmation.guestEmail}</span>
                  </div>
                  {confirmation.guestPhone && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Phone: </span>
                      <span className="font-medium text-slate-900 dark:text-white">{confirmation.guestPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Reservation Milestones Timeline
              </h3>
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6 pl-5">
                {confirmation.timeline?.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.status}
                        </span>
                        {item.paymentStatus && (
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            {item.paymentStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(item.timestamp).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Policy Column (1 col) */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Financial Snapshot
              </h3>

              <div className="space-y-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Room Base Price</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ₹{confirmation.basePriceSnapshot?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {confirmation.taxesAmount > 0
                      ? `₹${confirmation.taxesAmount.toLocaleString('en-IN')}`
                      : '₹0'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ₹{confirmation.totalAmount?.toLocaleString('en-IN')} {confirmation.currency}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <p className="font-medium text-slate-700 dark:text-slate-300">Honest Disclosure</p>
                <p>{confirmation.taxDisclosure}</p>
                <p className="text-[11px] text-slate-400">Provenance: {confirmation.pricingProvenance}</p>
              </div>
            </div>

            {/* Cancellation Policy Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Cancellation Policy
              </h3>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {confirmation.cancellationPolicySnapshot || 'Standard Policy'}
              </p>
              {confirmation.cancellationDeadline && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Free cancellation deadline:{' '}
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Date(confirmation.cancellationDeadline).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </p>
              )}
              {confirmation.cancellationDisclosure && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {confirmation.cancellationDisclosure}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
