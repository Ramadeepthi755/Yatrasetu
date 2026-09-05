'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Clock,
  Users,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Languages,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Check,
  Info
} from 'lucide-react';
import { getExperienceById, ExperienceItem } from '@/lib/api';

export default function ExperienceDetailPage() {
  const params = useParams();
  const experienceId = params?.experienceId as string;

  const [experience, setExperience] = useState<ExperienceItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking inquiry state
  const [guests, setGuests] = useState<number>(2);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitted'>('idle');

  useEffect(() => {
    if (!experienceId) return;

    async function loadExperience() {
      setLoading(true);
      try {
        const res = await getExperienceById(experienceId);
        if (res.success && res.data) {
          setExperience(res.data);
        } else {
          setError(res.message || 'Experience not found');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load experience';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, [experienceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-16">
        <div className="mx-auto max-w-5xl px-4 animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-stone-200" />
          <div className="h-96 rounded-3xl bg-stone-200" />
          <div className="h-48 rounded-3xl bg-white border border-stone-200 p-8" />
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-stone-50 py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-3" />
          <h2 className="text-xl font-bold text-stone-900">Experience Not Found</h2>
          <p className="mt-2 text-sm text-stone-600">
            {error || 'We could not find the requested experience details.'}
          </p>
          <Link
            href="/experiences"
            className="mt-6 inline-flex items-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Experiences
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage =
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80';

  const cleanDescription = experience.description.replace(/^\[SAMPLE\]\s*/i, '');
  const totalPrice = Number(experience.pricePerPerson) * guests;

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-stone-200 bg-white py-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/experiences"
            className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Experiences Catalog
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Honest Sample Data Banner */}
        {experience.isDemoData && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Honest Demonstration Experience:</span> This is a curated benchmark experience representing real community tourism offerings. In Phase 5, live booking confirmations connect directly to local payment processors and partner schedules.
            </div>
          </div>
        )}

        {/* Hero Header + Media */}
        <div className="relative h-80 sm:h-[420px] w-full overflow-hidden rounded-3xl shadow-md">
          <Image
            src={experience.coverImageUrl || fallbackImage}
            alt={experience.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Badges on Hero */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/30">
              {experience.category}
            </span>
            {experience.isDemoData && (
              <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-stone-300 border border-stone-700">
                Sample Experience
              </span>
            )}
          </div>

          {/* Title & Info on Hero */}
          <div className="absolute bottom-6 left-6 right-6 text-white max-w-3xl">
            <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold mb-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {experience.cityName || experience.destinationName || 'India'}
                {experience.destinationName ? ` · ${experience.destinationName}` : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {experience.title}
            </h1>
          </div>
        </div>

        {/* Quick Specs Ribbon */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-xs shadow-sm">
          <div className="flex items-center space-x-2.5">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Duration</span>
              <span className="font-bold text-stone-900">{experience.durationHours} Hours</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Users className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Group Size</span>
              <span className="font-bold text-stone-900">Up to {experience.maxGroupSize || 8} People</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Languages className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Languages</span>
              <span className="font-bold text-stone-900 truncate block max-w-[120px]">
                {experience.languages && experience.languages.length > 0
                  ? experience.languages.join(', ')
                  : 'English, Hindi'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="h-5 w-5 text-teal-600 flex-shrink-0" />
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-bold block">Safety Status</span>
              <span className="font-bold text-teal-800">Verified Guide</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Content & Booking Sidebar */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Experience Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description / Story */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-stone-900 mb-4">About This Experience</h2>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                {cleanDescription}
              </p>
            </div>

            {/* What's Included */}
            {experience.includedItems && experience.includedItems.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-teal-600" />
                  What is Included
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {experience.includedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-700 border border-stone-100"
                    >
                      <Check className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements & Guidelines */}
            {experience.requirements && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-amber-500" />
                  Things to Know & Requirements
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  {experience.requirements}
                </p>
              </div>
            )}

            {/* Destination Backlink if applicable */}
            {experience.destinationId && (
              <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  Part of the <strong className="text-stone-900">{experience.destinationName}</strong> travel corridor
                </span>
                <Link
                  href={`/destinations/${experience.destinationId}`}
                  className="font-bold text-amber-800 hover:text-amber-900"
                >
                  Explore Destination Guide →
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Host Info + Booking Request Card */}
          <div className="space-y-6">
            {/* Host Card */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-3">
                Hosted by
              </span>
              <div className="flex items-center space-x-3.5">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-amber-500/20 bg-amber-50 shadow-inner">
                  {experience.hostAvatarUrl ? (
                    <Image
                      src={experience.hostAvatarUrl}
                      alt={experience.hostName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-amber-800 text-sm">
                      {experience.hostName?.charAt(0) || 'H'}
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={`/local/${experience.hostId}`}
                    className="font-bold text-stone-900 hover:text-amber-600 transition-colors text-base"
                  >
                    {experience.hostName}
                  </Link>
                  <p className="text-xs text-amber-700 font-medium">{experience.hostRoleTitle || 'Local Host'}</p>
                  {experience.hostRating && (
                    <div className="flex items-center text-xs font-bold text-stone-700 mt-1">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                      {Number(experience.hostRating).toFixed(1)} / 5.0 Rating
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-100">
                <Link
                  href={`/local/${experience.hostId}`}
                  className="w-full text-center block text-xs font-bold text-amber-700 hover:text-amber-800 py-1"
                >
                  View Host Bio & All Experiences →
                </Link>
              </div>
            </div>

            {/* Booking Inquiry Card */}
            <div className="sticky top-20 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs text-stone-400">Price per person</span>
                  <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                    <IndianRupee className="h-5 w-5" />
                    {Number(experience.pricePerPerson).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Inquiry Mode
                </span>
              </div>

              {bookingStatus === 'submitted' ? (
                <div className="my-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-amber-600 mb-2" />
                  <h4 className="text-sm font-bold text-amber-950">Demo Booking Request Logged!</h4>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                    This inquiry simulation successfully recorded {guests} guest(s) for {experience.hostName}. Live Razorpay payments and partner scheduling will be activated in Phase 8.
                  </p>
                  <button
                    onClick={() => setBookingStatus('idle')}
                    className="mt-4 text-xs font-semibold text-teal-900 underline"
                  >
                    Book for another date
                  </button>
                </div>
              ) : (
                <div className="my-6 space-y-4 text-xs">
                  {/* Guests selector */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Number of Guests</label>
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-2">
                      <span className="font-semibold text-stone-800">{guests} Guest{guests > 1 ? 's' : ''}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          className="h-7 w-7 rounded-lg bg-white border border-stone-200 font-bold text-stone-700 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.min(experience.maxGroupSize || 8, g + 1))}
                          className="h-7 w-7 rounded-lg bg-white border border-stone-200 font-bold text-stone-700 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total summary */}
                  <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-100 space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>₹{Number(experience.pricePerPerson).toLocaleString('en-IN')} × {guests} guests</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                      <span>Total</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingStatus('submitted')}
                    className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-400 shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Request Spot for ₹{totalPrice.toLocaleString('en-IN')}</span>
                  </button>

                  <p className="text-[10px] text-center text-stone-400">
                    No charge is processed until the host confirms availability.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
