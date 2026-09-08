'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Star,
  MapPin,
  CheckCircle,
  IndianRupee,
  Languages,
  ArrowLeft,
  Calendar,
  Landmark,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Award,
  Sparkles,
  Clock,
  Users,
  Check,
  Loader2
} from 'lucide-react';
import { getLocalHostById, createExperienceBooking, LocalHostDetail } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ExperienceCard } from '@/components/explore/ExperienceCard';

export default function LocalHostProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token, requireAuth } = useAuth();
  const hostId = params?.hostId as string;

  const [host, setHost] = useState<LocalHostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(searchParams.get('action') === 'book');
  const [bookingType, setBookingType] = useState<'PREDEFINED' | 'CUSTOMIZED'>('PREDEFINED');
  const [selectedExpId, setSelectedExpId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('09:00 AM');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [customRequirements, setCustomRequirements] = useState<string>('');
  const [bookingSubmitting, setBookingSubmitting] = useState<boolean>(false);
  const [bookingSuccessRef, setBookingSuccessRef] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (!hostId) return;

    async function loadHost() {
      setLoading(true);
      try {
        const res = await getLocalHostById(hostId);
        if (res.success && res.data) {
          setHost(res.data);
          if (res.data.experiences && res.data.experiences.length > 0) {
            setSelectedExpId(res.data.experiences[0].id);
          }
        } else {
          setError(res.message || 'Host not found');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load host profile';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadHost();
  }, [hostId]);

  const handleOpenBooking = (type: 'PREDEFINED' | 'CUSTOMIZED', expId?: string) => {
    if (!requireAuth(`/local/${hostId}?action=book`)) return;
    setBookingType(type);
    if (expId) setSelectedExpId(expId);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      requireAuth(`/local/${hostId}?action=book`);
      return;
    }

    setBookingSubmitting(true);
    setBookingError(null);

    try {
      const selectedExp = host?.experiences?.find((e) => e.id === selectedExpId);
      const calculatedAmount =
        bookingType === 'PREDEFINED' && selectedExp
          ? Number(selectedExp.pricePerPerson) * guestCount
          : Number(host?.pricePerHour || 500) * 3 * guestCount;

      const res = await createExperienceBooking(
        {
          hostId,
          experienceId: bookingType === 'PREDEFINED' ? selectedExpId : undefined,
          destinationId: host?.destinationId || undefined,
          bookingType,
          bookingDate: selectedDate,
          startTime,
          guestCount,
          totalAmount: calculatedAmount,
          customRequirements: customRequirements.trim() || undefined,
          notes: bookingType === 'CUSTOMIZED' ? 'Custom itinerary requested by traveler.' : undefined,
        },
        token
      );

      if (res.success && res.data) {
        setBookingSuccessRef(res.data.bookingReference);
        setTimeout(() => {
          router.push(`/bookings`);
        }, 2000);
      }
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Failed to submit booking request');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-16">
        <div className="mx-auto max-w-4xl px-4 animate-pulse space-y-6">
          <div className="h-8 w-36 rounded bg-stone-200" />
          <div className="h-64 rounded-3xl bg-white border border-stone-200 p-8" />
          <div className="h-48 rounded-3xl bg-white border border-stone-200 p-8" />
        </div>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="min-h-screen bg-stone-50 py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-3" />
          <h2 className="text-xl font-bold text-stone-900">Local Guide Not Found</h2>
          <p className="mt-2 text-sm text-stone-600">
            {error || 'We could not locate this host profile in our directory.'}
          </p>
          <Link
            href="/local"
            className="mt-6 inline-flex items-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Local Guides
          </Link>
        </div>
      </div>
    );
  }

  const initials = host.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-stone-200 bg-white py-3">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/local"
            className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Local Guides
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Host Profile Header Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Avatar + Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-amber-500 bg-amber-50 shadow-md">
                {host.avatarUrl ? (
                  <Image
                    src={host.avatarUrl}
                    alt={host.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-extrabold text-amber-900 text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
                    {host.name}
                  </h1>
                  {host.isVerified ? (
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200 shadow-sm">
                      <ShieldCheck className="h-4 w-4 mr-1 text-teal-600" /> YatraSetu Verified Partner
                    </span>
                  ) : (
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 border border-stone-200">
                      Identity Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm font-semibold text-amber-800">{host.roleTitle}</p>

                <p className="mt-2 flex items-center justify-center sm:justify-start text-xs text-stone-500">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-stone-400" />
                  {host.cityName || host.stateName || 'India'}
                  {host.destinationName ? ` · Dedicated Service Area: ${host.destinationName}` : ''}
                </p>

                {/* Rating & Tours count */}
                <div className="mt-3 flex items-center justify-center sm:justify-start space-x-3 text-xs">
                  <span className="flex items-center font-bold text-stone-900 bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-900">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                    {Number(host.rating || 4.9).toFixed(1)} / 5.0
                  </span>
                  <span className="text-stone-600 font-medium">
                    {host.experienceCount || 100}+ verified tours conducted
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-teal-700 font-medium flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> {host.availability || 'Available for Bookings'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Rates & Booking Actions */}
            <div className="flex flex-col items-center sm:items-end border-t sm:border-t-0 border-stone-100 pt-4 sm:pt-0">
              <span className="text-xs text-stone-400 font-semibold">Standard Guide Rate</span>
              <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                <IndianRupee className="h-5 w-5" />
                {Number(host.pricePerHour || 500).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-stone-500 ml-1">/hour</span>
              </div>

              <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenBooking('PREDEFINED')}
                  className="w-full rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-400 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Calendar className="h-4 w-4" />
                  Book Tour Experience
                </button>
                <button
                  onClick={() => handleOpenBooking('CUSTOMIZED')}
                  className="w-full rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-stone-800 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Request Custom Itinerary
                </button>
              </div>
            </div>
          </div>

          {/* Languages Spoken & Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-6 text-xs">
            <div className="flex items-start space-x-2.5">
              <Languages className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-stone-900">Languages Spoken</span>
                <p className="text-stone-600 mt-0.5 font-medium">
                  {host.languages && host.languages.length > 0
                    ? host.languages.join(', ')
                    : 'English, Hindi'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Award className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-stone-900">Local Expertise & Specializations</span>
                <p className="text-stone-600 mt-0.5 font-medium">
                  {host.skills && host.skills.length > 0
                    ? host.skills.join(' · ')
                    : 'Architectural Tours, Cultural Walking Paths'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Biography & Cultural Background */}
        {host.about && (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 flex items-center mb-3">
              <Landmark className="h-4 w-4 mr-2 text-amber-600" />
              Local Background & Provenance
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {host.about}
            </p>

            {host.interests && host.interests.length > 0 && (
              <div className="mt-6 pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Specialized Focus Areas
                </span>
                <div className="flex flex-wrap gap-2">
                  {host.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hosted Experiences Section */}
        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 sm:text-2xl">
                Available Guided Experiences ({host.experiences?.length || 0})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Predefined heritage walks, artisan workshops, and food trails
              </p>
            </div>
            {host.destinationId && (
              <Link
                href={`/destinations/${host.destinationId}`}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                View Destination ({host.destinationName}) →
              </Link>
            )}
          </div>

          {host.experiences && host.experiences.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {host.experiences.map((exp) => (
                <div key={exp.id} className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:border-amber-400 transition">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{exp.title}</h3>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-3">{exp.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-stone-700">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> {exp.durationHours} hours
                      <span className="text-stone-300">·</span>
                      <Users className="w-3.5 h-3.5 text-amber-600" /> Max {exp.maxGroupSize} guests
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold">Per Person</span>
                      <p className="text-base font-black text-amber-900">₹{Number(exp.pricePerPerson).toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('PREDEFINED', exp.id)}
                      className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow-xs"
                    >
                      Book This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center text-xs text-stone-500">
              <Calendar className="mx-auto h-8 w-8 text-stone-300 mb-2" />
              No public group walks listed. Click &quot;Request Custom Itinerary&quot; above to request a personalized session.
            </div>
          )}
        </div>
      </div>

      {/* Booking & Customized Request Modal (Tasks 11, 13) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {bookingSuccessRef ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Booking Request Created!</h3>
                <p className="text-xs text-stone-600">
                  Your request has been submitted with reference{' '}
                  <strong className="text-amber-800">{bookingSuccessRef}</strong>.
                </p>
                <p className="text-xs text-stone-500">
                  Redirecting to your Bookings Dashboard to view booking status and complete payment...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      {bookingType === 'PREDEFINED' ? 'Book Experience' : 'Request Custom Itinerary'}
                    </h3>
                    <p className="text-xs text-stone-500">With {host.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100"
                  >
                    ✕
                  </button>
                </div>

                {bookingError && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
                    {bookingError}
                  </div>
                )}

                {/* Booking Mode Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBookingType('PREDEFINED')}
                    className={`py-2 rounded-lg transition ${
                      bookingType === 'PREDEFINED' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Predefined Tour
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType('CUSTOMIZED')}
                    className={`py-2 rounded-lg transition ${
                      bookingType === 'CUSTOMIZED' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    Customized Itinerary
                  </button>
                </div>

                {/* Predefined Experience Select */}
                {bookingType === 'PREDEFINED' && host.experiences && host.experiences.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Select Experience
                    </label>
                    <select
                      value={selectedExpId}
                      onChange={(e) => setSelectedExpId(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800"
                    >
                      {host.experiences.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.title} (₹{exp.pricePerPerson}/person)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Start Time
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800"
                    >
                      <option value="07:00 AM">07:00 AM (Sunrise Walk)</option>
                      <option value="09:00 AM">09:00 AM (Morning Tour)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon)</option>
                      <option value="05:00 PM">05:00 PM (Evening / Heritage Walk)</option>
                    </select>
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Number of Guests: {guestCount}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-bold">
                    <span>1 person</span>
                    <span>5 people</span>
                    <span>10 people</span>
                  </div>
                </div>

                {/* Custom requirements / notes */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {bookingType === 'CUSTOMIZED' ? 'Describe Your Dream Custom Itinerary' : 'Special Notes or Accessibility Requirements'}
                  </label>
                  <textarea
                    rows={3}
                    value={customRequirements}
                    onChange={(e) => setCustomRequirements(e.target.value)}
                    placeholder={
                      bookingType === 'CUSTOMIZED'
                        ? 'e.g. Focus on 16th century Golconda architecture and authentic Nizami food tasting for a family with photography interests...'
                        : 'e.g. Please arrange audio headsets; vegetarian tasting preferences.'
                    }
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs font-medium text-stone-800 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Price summary */}
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-500 font-bold uppercase text-[10px]">Estimated Total</span>
                    <p className="text-lg font-black text-amber-950">
                      ₹
                      {(bookingType === 'PREDEFINED'
                        ? Number(host.experiences?.find((e) => e.id === selectedExpId)?.pricePerPerson || 800) * guestCount
                        : Number(host.pricePerHour || 500) * 3 * guestCount
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-800 font-semibold text-right">
                    Razorpay Secure Checkout <br /> Zero Middlemen Fee
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-stone-950 hover:bg-amber-400 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting to Guide...
                      </>
                    ) : (
                      'Confirm Booking Request'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
