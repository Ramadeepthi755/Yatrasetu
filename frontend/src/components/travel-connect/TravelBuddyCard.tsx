'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TravelerDiscovery } from '@/lib/api';
import {
  MapPin,
  Calendar,
  Sparkles,
  UserPlus,
  CheckCircle2,
  Clock,
  MessageCircle,
  Tag,
  Languages,
  ArrowRight,
} from 'lucide-react';
import ConnectModal from './ConnectModal';

interface TravelBuddyCardProps {
  traveler: TravelerDiscovery;
  onConnectionChange?: (travelerId: string, status: 'PENDING_SENT') => void;
}

export default function TravelBuddyCard({ traveler, onConnectionChange }: TravelBuddyCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<string>(traveler.connectionStatus || 'NONE');

  const handleConnectSuccess = (requestId: string) => {
    setStatus('PENDING_SENT');
    setShowModal(false);
    if (onConnectionChange) {
      onConnectionChange(traveler.userId, 'PENDING_SENT');
    }
  };

  const getMatchScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-gray-200/80 hover:border-amber-400/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
        {/* Top header accent */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

        <div className="p-5 flex-1 flex flex-col">
          {/* Header row: Avatar + Name + Match Badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {traveler.profileImageUrl ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-amber-200">
                  <Image
                    src={traveler.profileImageUrl}
                    alt={traveler.displayName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900 font-bold text-lg flex items-center justify-center shrink-0 border border-amber-300/60 shadow-inner">
                  {traveler.displayName ? traveler.displayName.charAt(0).toUpperCase() : 'T'}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href={`/travel-connect/${traveler.userId}`}
                    className="font-bold text-gray-900 hover:text-amber-700 transition text-base truncate"
                  >
                    {traveler.displayName}
                  </Link>
                </div>
                {traveler.isDemoData && (
                  <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300/60 mt-0.5">
                    Sample Traveler
                  </span>
                )}
              </div>
            </div>

            {/* Deterministic Match Badge */}
            <div
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${getMatchScoreBadgeColor(
                traveler.matchScore
              )}`}
              title="Deterministic Match Score based on Destination, Dates, Interests, Style & Languages"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{traveler.matchScore}% Match</span>
            </div>
          </div>

          {/* Destination & Dates */}
          <div className="space-y-1.5 mb-3.5 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 font-medium text-gray-800">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                {traveler.destinationName || traveler.destinationCity}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                <span>
                  {traveler.travelDate}
                  {traveler.endDate ? ` – ${traveler.endDate}` : ''}
                </span>
              </div>
              {traveler.flexibleDates && (
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold">
                  Flexible
                </span>
              )}
            </div>
          </div>

          {/* Bio snippet */}
          {traveler.bio && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3.5 italic leading-relaxed">
              &ldquo;{traveler.bio}&rdquo;
            </p>
          )}

          {/* Travel Style + Interests */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200/60 rounded-md">
                <Tag className="w-2.5 h-2.5" />
                {traveler.travelStyle}
              </span>

              {traveler.languages && traveler.languages.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                  <Languages className="w-2.5 h-2.5 text-gray-500" />
                  {traveler.languages.slice(0, 2).join(', ')}
                </span>
              )}
            </div>

            {traveler.interests && traveler.interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {traveler.interests.slice(0, 3).map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 bg-amber-50/80 text-amber-900 border border-amber-200/50 rounded-full"
                  >
                    #{interest}
                  </span>
                ))}
                {traveler.interests.length > 3 && (
                  <span className="text-[10px] text-gray-400 self-center">
                    +{traveler.interests.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Match Reasons Checklist */}
          {traveler.matchReasons && traveler.matchReasons.length > 0 && (
            <div className="mt-auto pt-2.5 border-t border-dashed border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Why You Match:
              </span>
              <ul className="space-y-0.5 text-[11px] text-gray-600">
                {traveler.matchReasons.slice(0, 3).map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-2">
          <Link
            href={`/travel-connect/${traveler.userId}`}
            className="text-xs font-semibold text-gray-600 hover:text-amber-700 flex items-center gap-1 transition"
          >
            Profile
            <ArrowRight className="w-3 h-3" />
          </Link>

          {status === 'CONNECTED' ? (
            <Link
              href="/travel-connect/connections"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-200 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Message
            </Link>
          ) : status === 'PENDING_SENT' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl">
              <Clock className="w-3.5 h-3.5" />
              Request Sent
            </span>
          ) : status === 'PENDING_RECEIVED' ? (
            <Link
              href="/travel-connect/requests"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-xl hover:bg-indigo-200 transition"
            >
              Respond
            </Link>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Connect
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <ConnectModal
          traveler={traveler}
          onClose={() => setShowModal(false)}
          onSuccess={handleConnectSuccess}
        />
      )}
    </>
  );
}
