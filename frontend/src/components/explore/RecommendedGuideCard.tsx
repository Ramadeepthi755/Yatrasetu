'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, CheckCircle, IndianRupee, Languages, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { RecommendedGuide } from '@/lib/api';

interface RecommendedGuideCardProps {
  item: RecommendedGuide;
  onSelectExperience?: (experienceId: string) => void;
  onRequestCustom?: () => void;
}

export function RecommendedGuideCard({ item, onSelectExperience, onRequestCustom }: RecommendedGuideCardProps) {
  const { guide, matchScore, matchReasons, availableExperiences } = item;
  const initials = guide.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-white to-amber-50/20 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400">
      <div>
        {/* Match Header Badge */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{Math.round(matchScore)}% Compatibility Match</span>
          </div>
          <span className="flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 border border-teal-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1 text-teal-600" /> YatraSetu Verified
          </span>
        </div>

        {/* Top Profile Header */}
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400 bg-amber-50 shadow-md">
            {guide.avatarUrl ? (
              <Image
                src={guide.avatarUrl}
                alt={guide.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-amber-900 text-base">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link
              href={`/local/${guide.id}`}
              className="font-extrabold text-stone-900 hover:text-amber-600 transition-colors truncate text-lg block"
            >
              {guide.name}
            </Link>
            <p className="text-xs font-semibold text-amber-800 mt-0.5">{guide.roleTitle}</p>
            <p className="text-xs text-stone-500 flex items-center mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-stone-400 flex-shrink-0" />
              {guide.cityName || guide.destinationName || 'India'}
            </p>
          </div>
        </div>

        {/* Why Recommended Section */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-amber-700" /> Why Recommended:
            </p>
            <div className="space-y-1">
              {matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-700 font-medium">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages and Skills */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          {guide.languages && (
            <div className="flex items-center gap-1 text-stone-600">
              <Languages className="h-3.5 w-3.5 text-stone-400" />
              <span className="font-medium">{guide.languages.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Available Experience Pills */}
        {availableExperiences && availableExperiences.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-stone-100">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Featured Experience:
            </p>
            <div className="space-y-1.5">
              {availableExperiences.slice(0, 2).map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-lg bg-stone-50 p-2 border border-stone-200 text-xs"
                >
                  <span className="font-semibold text-stone-800 line-clamp-1 flex-1 mr-2">{exp.title}</span>
                  <span className="font-bold text-amber-800 flex-shrink-0">
                    ₹{Number(exp.pricePerPerson).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer & CTAs */}
      <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="font-bold text-stone-900 text-sm">{Number(guide.rating || 4.9).toFixed(1)}</span>
            <span className="text-stone-400 text-xs">({guide.experienceCount || 100}+ tours)</span>
          </div>
          <div className="flex items-center font-bold text-stone-900 text-base">
            <IndianRupee className="h-4 w-4" />
            <span>{Number(guide.pricePerHour || 500).toLocaleString('en-IN')}</span>
            <span className="text-xs font-normal text-stone-500"> /hr</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/local/${guide.id}`}
            className="flex items-center justify-center rounded-xl bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-200 text-center"
          >
            <Compass className="h-3.5 w-3.5 mr-1" />
            Full Profile
          </Link>
          <Link
            href={`/local/${guide.id}?action=book`}
            className="flex items-center justify-center rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-stone-950 transition hover:bg-amber-400 shadow-sm text-center"
          >
            <span>Book Guide</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
