'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  getTravelerProfile,
  blockUser,
  TravelerProfile,
  TravelerDiscovery,
} from '@/lib/api';
import TravelConnectNav from '@/components/travel-connect/TravelConnectNav';
import ConnectModal from '@/components/travel-connect/ConnectModal';
import {
  MapPin,
  Calendar,
  Sparkles,
  UserPlus,
  Clock,
  MessageCircle,
  Tag,
  Languages,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle2,
} from 'lucide-react';

export default function TravelerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const travelerId = params.travelerId as string;

  const { user, token, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [status, setStatus] = useState<'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED'>('NONE');
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!travelerId) return;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTravelerProfile(travelerId, token || undefined);
        if (res.success && res.data) {
          setProfile(res.data);
          setStatus(res.data.connectionStatus || 'NONE');
        } else {
          setError(res.message || 'Traveler profile not found.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load traveler profile.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [travelerId, token]);

  const handleBlock = async () => {
    if (!isAuthenticated) return;
    if (!confirm('Are you sure you want to block this user? They will not be able to contact you or see your trips.')) {
      return;
    }

    setBlocking(true);
    try {
      await blockUser(travelerId, token || undefined);
      setBlocked(true);
      setTimeout(() => {
        router.push('/travel-connect');
      }, 1500);
    } catch (err) {
      alert('Failed to block user.');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <TravelConnectNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-gray-400">
          Loading travel profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <TravelConnectNav />
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Profile Unavailable</h2>
          <p className="text-xs text-gray-500">{error || 'Unable to view this traveler profile.'}</p>
          <Link
            href="/travel-connect"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-amber-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Travel Connect
          </Link>
        </div>
      </div>
    );
  }

  // Create a synthetic TravelerDiscovery object if user wants to connect from here
  const primaryTrip = profile.upcomingTrips && profile.upcomingTrips.length > 0 ? profile.upcomingTrips[0] : null;
  const discoveryObj: TravelerDiscovery = {
    id: primaryTrip ? primaryTrip.id : profile.id,
    userId: profile.id,
    displayName: profile.displayName,
    profileImageUrl: profile.profileImageUrl,
    bio: profile.bio,
    destinationId: primaryTrip?.destinationId,
    destinationName: primaryTrip?.destinationName,
    destinationCity: primaryTrip ? primaryTrip.destinationCity : 'India',
    travelDate: primaryTrip ? primaryTrip.travelDate : 'Upcoming',
    endDate: primaryTrip?.endDate,
    flexibleDates: primaryTrip?.flexibleDates,
    travelStyle: profile.travelStyle || 'Cultural Explorer',
    interests: profile.interests,
    languages: profile.languages,
    isDemoData: profile.isDemoData,
    matchScore: 85,
    matchReasons: ['Shared travel style', 'Language match'],
    connectionStatus: status,
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <TravelConnectNav />

      {/* Top Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link
          href="/travel-connect"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-amber-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Discover Travelers
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Header Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 relative" />

          {/* Profile Details Container */}
          <div className="px-6 sm:px-8 pb-8 relative">
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4 mb-5">
              <div className="flex items-end gap-4">
                {profile.profileImageUrl ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0">
                    <Image
                      src={profile.profileImageUrl}
                      alt={profile.displayName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900 font-black text-3xl flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                    {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'T'}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-gray-900">{profile.displayName}</h1>
                    {profile.isDemoData && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Sample Traveler
                      </span>
                    )}
                  </div>
                  {profile.travelStyle && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-md">
                      <Tag className="w-3 h-3" />
                      {profile.travelStyle}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {user?.id !== profile.id && (
                <div className="flex items-center gap-2">
                  {status === 'CONNECTED' ? (
                    <Link
                      href="/travel-connect/connections"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message Connected Buddy
                    </Link>
                  ) : status === 'PENDING_SENT' ? (
                    <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200">
                      <Clock className="w-4 h-4" />
                      Request Sent
                    </span>
                  ) : status === 'PENDING_RECEIVED' ? (
                    <Link
                      href="/travel-connect/requests"
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
                    >
                      Respond to Request
                    </Link>
                  ) : (
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      Send Connection Request
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                &ldquo;{profile.bio}&rdquo;
              </div>
            )}

            {/* Details Grid: Languages & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-amber-600" />
                  Languages Spoken
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.languages && profile.languages.length > 0 ? (
                    profile.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-medium"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Not specified</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Travel Interests & Passions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-lg text-xs font-semibold"
                      >
                        #{interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Trips Section */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Planned Trips & Journeys
            </h2>
            <span className="text-xs font-bold text-gray-500">
              {profile.upcomingTrips?.length || 0} trip(s)
            </span>
          </div>

          {profile.upcomingTrips && profile.upcomingTrips.length > 0 ? (
            <div className="space-y-3">
              {profile.upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 hover:border-amber-300 transition space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-gray-900 text-sm">
                        {trip.destinationName || trip.destinationCity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {trip.travelDate}
                        {trip.endDate ? ` – ${trip.endDate}` : ''}
                      </span>
                      {trip.flexibleDates && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          Flexible Dates
                        </span>
                      )}
                    </div>
                  </div>

                  {trip.notes && (
                    <p className="text-xs text-gray-600 italic">&ldquo;{trip.notes}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-2xl border border-gray-100">
              No active upcoming trips listed for this traveler.
            </div>
          )}
        </div>

        {/* Safety & Moderation Footer */}
        {user?.id !== profile.id && (
          <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-500" />
              <span>Safety Tip: Always verify plans in public places and never share financial credentials.</span>
            </div>

            {isAuthenticated && !blocked && (
              <button
                onClick={handleBlock}
                disabled={blocking}
                className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1 shrink-0 ml-4 transition"
              >
                <Ban className="w-3.5 h-3.5" />
                {blocking ? 'Blocking...' : 'Block Traveler'}
              </button>
            )}

            {blocked && (
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Traveler Blocked
              </span>
            )}
          </div>
        )}
      </div>

      {showConnectModal && (
        <ConnectModal
          traveler={discoveryObj}
          onClose={() => setShowConnectModal(false)}
          onSuccess={() => {
            setStatus('PENDING_SENT');
            setShowConnectModal(false);
          }}
        />
      )}
    </div>
  );
}
