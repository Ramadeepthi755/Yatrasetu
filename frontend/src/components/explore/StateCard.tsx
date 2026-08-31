'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Compass } from 'lucide-react';
import { StateSummary } from '@/lib/api';

interface StateCardProps {
  state: StateSummary;
}

export function StateCard({ state }: StateCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = state.bannerImageUrl && state.bannerImageUrl.trim() !== '' && !imageError;

  return (
    <Link
      href={`/states/${state.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-400"
    >
      <div className="relative h-44 w-full overflow-hidden bg-stone-900">
        {hasImage ? (
          <img
            src={state.bannerImageUrl}
            alt={state.stateName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-800 flex flex-col items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-105">
            <Compass className="h-10 w-10 text-amber-400 mb-2 opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              {state.region}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-bold text-stone-950 backdrop-blur-md">
            {state.destinationCount} {state.destinationCount === 1 ? 'Dest' : 'Dests'}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
            {state.stateName}
          </h3>
          <p className="text-xs text-stone-300 flex items-center mt-0.5">
            <MapPin className="h-3 w-3 mr-1 text-amber-400" />
            {state.region} {state.capitalCity ? `• Capital: ${state.capitalCity}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3.5 text-xs text-stone-600 bg-stone-50/50">
        <span className="font-medium">{state.cityCount} {state.cityCount === 1 ? 'City' : 'Cities'} tracked</span>
        <span className="font-semibold text-indigo-900 group-hover:translate-x-1 transition-transform">
          View State &rarr;
        </span>
      </div>
    </Link>
  );
}
