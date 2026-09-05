'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users, Star, IndianRupee, MapPin, Sparkles } from 'lucide-react';
import { ExperienceItem } from '@/lib/api';

interface ExperienceCardProps {
  experience: ExperienceItem;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const fallbackImage =
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400">
      <div>
        {/* Cover Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-stone-100">
          <Image
            src={experience.coverImageUrl || fallbackImage}
            alt={experience.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-amber-300 border border-amber-400/30">
              {experience.category}
            </span>

            {experience.isDemoData && (
              <span className="rounded-full bg-stone-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-stone-300 border border-stone-700">
                Sample Experience
              </span>
            )}
          </div>

          {/* Bottom Overlay Location */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-stone-200 font-medium">
            <span className="flex items-center truncate">
              <MapPin className="h-3.5 w-3.5 mr-1 text-amber-400 flex-shrink-0" />
              {experience.cityName || experience.destinationName || 'India'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          <Link
            href={`/experiences/${experience.id}`}
            className="font-bold text-stone-900 hover:text-amber-600 transition-colors line-clamp-2 text-base leading-snug"
          >
            {experience.title}
          </Link>

          <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {experience.description.replace(/^\[SAMPLE\]\s*/i, '')}
          </p>

          {/* Experience Quick Specs */}
          <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 text-stone-400" />
              {experience.durationHours} hrs
            </span>
            <span className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 text-stone-400" />
              Up to {experience.maxGroupSize || 8}
            </span>
          </div>

          {/* Host Info */}
          <div className="mt-3.5 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
            <div className="flex items-center space-x-2 truncate">
              <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-amber-100 text-[10px] font-bold text-amber-800 flex items-center justify-center">
                {experience.hostAvatarUrl ? (
                  <Image
                    src={experience.hostAvatarUrl}
                    alt={experience.hostName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  experience.hostName?.charAt(0) || 'H'
                )}
              </div>
              <span className="text-stone-700 font-medium truncate">
                {experience.hostName}
              </span>
            </div>

            {experience.hostRating && (
              <div className="flex items-center text-stone-700 font-semibold flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                {Number(experience.hostRating).toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Price and Action */}
      <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/70 px-4 py-3 text-xs">
        <div>
          <span className="text-stone-400 text-[11px]">From</span>
          <p className="text-sm font-bold text-stone-900 flex items-center">
            <IndianRupee className="h-3.5 w-3.5" />
            {Number(experience.pricePerPerson).toLocaleString('en-IN')}
            <span className="text-xs font-normal text-stone-500"> /person</span>
          </p>
        </div>

        <Link
          href={`/experiences/${experience.id}`}
          className="inline-flex items-center rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-400 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Explore
        </Link>
      </div>
    </div>
  );
}
