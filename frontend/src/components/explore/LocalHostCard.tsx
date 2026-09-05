'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, CheckCircle, IndianRupee, Languages, Compass } from 'lucide-react';
import { LocalHost } from '@/lib/api';

interface LocalHostCardProps {
  host: LocalHost;
}

export function LocalHostCard({ host }: LocalHostCardProps) {
  const initials = host.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-400">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-amber-500/20 bg-amber-50 shadow-inner">
            {host.avatarUrl ? (
              <Image
                src={host.avatarUrl}
                alt={host.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-amber-800 text-sm">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5">
              <Link
                href={`/local/${host.id}`}
                className="font-bold text-stone-900 hover:text-amber-600 transition-colors truncate text-base"
              >
                {host.name}
              </Link>
              {host.isDemoData ? (
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                  Sample Guide
                </span>
              ) : host.isVerified ? (
                <span className="flex items-center rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                  <CheckCircle className="h-3 w-3 mr-0.5" /> Verified Partner
                </span>
              ) : null}
            </div>

            <p className="text-xs font-medium text-amber-700 mt-0.5">{host.roleTitle}</p>

            <p className="text-xs text-stone-500 flex items-center mt-1 truncate">
              <MapPin className="h-3 w-3 mr-1 text-stone-400 flex-shrink-0" />
              {host.cityName || host.stateName || 'India'}
              {host.destinationName ? ` · ${host.destinationName}` : ''}
            </p>
          </div>
        </div>

        {/* Bio snippet */}
        {host.about && (
          <p className="mt-3 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {host.about}
          </p>
        )}

        {/* Skills & Specializations */}
        {host.skills && host.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {host.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700"
              >
                {skill}
              </span>
            ))}
            {host.skills.length > 3 && (
              <span className="text-[10px] font-medium text-stone-400 self-center">
                +{host.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Languages */}
        {host.languages && host.languages.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
            <Languages className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
            <span className="truncate">{host.languages.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Footer with Price, Rating and CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
        <div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center font-bold text-stone-900">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
              {Number(host.rating || 4.5).toFixed(1)}
            </div>
            <span className="text-stone-400 text-[11px]">
              ({host.experienceCount || 0} tours)
            </span>
          </div>
          <div className="mt-0.5 flex items-center font-bold text-stone-900">
            <IndianRupee className="h-3 w-3" />
            <span>{Number(host.pricePerHour || 300).toLocaleString('en-IN')}</span>
            <span className="text-[11px] font-normal text-stone-500"> /hr</span>
          </div>
        </div>

        <Link
          href={`/local/${host.id}`}
          className="inline-flex items-center rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-400 shadow-sm"
        >
          <Compass className="h-3.5 w-3.5 mr-1" />
          View Profile
        </Link>
      </div>
    </div>
  );
}
