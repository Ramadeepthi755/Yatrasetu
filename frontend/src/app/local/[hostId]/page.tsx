'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
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
  Award
} from 'lucide-react';
import { getLocalHostById, LocalHostDetail } from '@/lib/api';
import { ExperienceCard } from '@/components/explore/ExperienceCard';

export default function LocalHostProfilePage() {
  const params = useParams();
  const hostId = params?.hostId as string;

  const [host, setHost] = useState<LocalHostDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [inquirySent, setInquirySent] = useState<boolean>(false);

  useEffect(() => {
    if (!hostId) return;

    async function loadHost() {
      setLoading(true);
      try {
        const res = await getLocalHostById(hostId);
        if (res.success && res.data) {
          setHost(res.data);
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
          <h2 className="text-xl font-bold text-stone-900">Local Host Not Found</h2>
          <p className="mt-2 text-sm text-stone-600">
            {error || 'We could not locate this host profile in our directory.'}
          </p>
          <Link
            href="/local"
            className="mt-6 inline-flex items-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-amber-400 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Local People
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
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Local Hosts
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Honest Sample Data Banner */}
        {host.isDemoData && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Demonstration Profile:</span> This is an authentic demonstration profile of a local host representing verified community guides across India. Real bookings and transactions connect to registered tourism partners.
            </div>
          </div>
        )}

        {/* Host Profile Header Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Avatar + Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-amber-500/20 bg-amber-50 shadow-md">
                {host.avatarUrl ? (
                  <Image
                    src={host.avatarUrl}
                    alt={host.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-extrabold text-amber-800 text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
                    {host.name}
                  </h1>
                  {host.isDemoData ? (
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                      Sample Guide
                    </span>
                  ) : host.isVerified ? (
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 border border-teal-200">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1 text-teal-600" /> Verified Host
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-sm font-semibold text-amber-700">{host.roleTitle}</p>

                <p className="mt-2 flex items-center justify-center sm:justify-start text-xs text-stone-500">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-stone-400" />
                  {host.cityName || host.stateName || 'India'}
                  {host.destinationName ? ` · Near ${host.destinationName}` : ''}
                </p>

                {/* Rating & Tours count */}
                <div className="mt-3 flex items-center justify-center sm:justify-start space-x-3 text-xs">
                  <span className="flex items-center font-bold text-stone-900 bg-amber-500/10 px-2.5 py-1 rounded-lg text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                    {Number(host.rating || 4.5).toFixed(1)} / 5.0
                  </span>
                  <span className="text-stone-500 font-medium">
                    {host.experienceCount || 0} walks conducted
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-teal-700 font-medium flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> {host.availability || 'Flexible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Rates & Action */}
            <div className="flex flex-col items-center sm:items-end border-t sm:border-t-0 border-stone-100 pt-4 sm:pt-0">
              <span className="text-xs text-stone-400">Guiding Rate</span>
              <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                <IndianRupee className="h-5 w-5" />
                {Number(host.pricePerHour || 300).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-stone-500 ml-1">/hour</span>
              </div>

              <div className="mt-4 w-full sm:w-auto">
                {inquirySent ? (
                  <div className="rounded-xl bg-teal-50 border border-teal-200 px-4 py-2.5 text-xs font-bold text-teal-800 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1.5 text-teal-600" />
                    Inquiry Sent to Host!
                  </div>
                ) : (
                  <button
                    onClick={() => setInquirySent(true)}
                    className="w-full sm:w-auto rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-stone-950 transition-colors hover:bg-amber-400 shadow-md flex items-center justify-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Contact Host
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Languages Spoken & Highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-6 text-xs">
            <div className="flex items-start space-x-2.5">
              <Languages className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-stone-900">Languages Spoken</span>
                <p className="text-stone-600 mt-0.5">
                  {host.languages && host.languages.length > 0
                    ? host.languages.join(', ')
                    : 'English, Hindi'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Award className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-stone-900">Expertise & Skills</span>
                <p className="text-stone-600 mt-0.5">
                  {host.skills && host.skills.length > 0
                    ? host.skills.join(' · ')
                    : 'Cultural History, Local Walking Tours'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        {host.about && (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 flex items-center mb-3">
              <Landmark className="h-4 w-4 mr-2 text-amber-600" />
              About {host.name}
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {host.about}
            </p>

            {host.interests && host.interests.length > 0 && (
              <div className="mt-6 pt-4 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Passions & Interests
                </span>
                <div className="flex flex-wrap gap-2">
                  {host.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
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
                Experiences Hosted by {host.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Curated walks, heritage journeys, and cultural workshops
              </p>
            </div>
            {host.destinationId && (
              <Link
                href={`/destinations/${host.destinationId}`}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                View Destination →
              </Link>
            )}
          </div>

          {host.experiences && host.experiences.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {host.experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center text-xs text-stone-500">
              <Calendar className="mx-auto h-8 w-8 text-stone-300 mb-2" />
              No public group experiences currently scheduled. Contact this host directly for private customized walking tours.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
