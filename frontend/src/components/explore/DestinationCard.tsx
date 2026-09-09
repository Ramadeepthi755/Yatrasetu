'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Star, ShieldCheck, Tag } from 'lucide-react';
import { DestinationSummary } from '@/lib/api';

interface DestinationCardProps {
  destination: DestinationSummary;
  featured?: boolean;
}

// Format factual and clean location label without raw administrative slashes
function formatLocationLabel(destination: DestinationSummary): string {
  const isCircuit = destination.destinationName.toLowerCase().includes('circuit') ||
                    destination.destinationName.toLowerCase().includes('trail') ||
                    destination.destinationName.toLowerCase().includes('belt') ||
                    destination.destinationName.toLowerCase().includes('route');

  const cleanDist = (destination.district || '').replace(/\s*\/\s*/g, ' & ').trim();
  const cleanCity = (destination.cityName || '').replace(/\s*\/\s*/g, ' & ').trim();
  const state = destination.stateName || '';

  if (isCircuit) {
    if (cleanDist && cleanDist.toLowerCase() !== 'multiple') {
      return `${cleanDist}, ${state}`;
    }
    return `Regional Circuit • ${state || 'India'}`;
  }

  if (cleanDist && cleanCity && cleanDist.toLowerCase() !== cleanCity.toLowerCase()) {
    return `${cleanCity}, ${cleanDist} District`;
  }
  if (cleanCity) {
    return state ? `${cleanCity}, ${state}` : cleanCity;
  }
  if (cleanDist) {
    return state ? `${cleanDist} District, ${state}` : `${cleanDist} District`;
  }
  return state || 'India';
}

export function DestinationCard({ destination, featured = false }: DestinationCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasImage = destination.heroImageUrl && destination.heroImageUrl.trim() !== '' && !imageError;
  const locationLabel = formatLocationLabel(destination);
  const accessibleAlt = `${destination.destinationName} landscape and cultural heritage, ${destination.stateName || 'India'}`;

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <Link
      href={`/destinations/${destination.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400/40 ${
        featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Visual Header / Image Container */}
      <div className={`relative w-full overflow-hidden bg-stone-900 ${featured ? 'h-64 md:h-80' : 'h-52'}`}>
        {hasImage ? (
          <img
            src={destination.heroImageUrl}
            alt={accessibleAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-stone-900 flex flex-col items-center justify-center p-6 text-stone-400 text-center">
            <span className="text-xs font-medium text-stone-400">
              Destination image currently unavailable
            </span>
            <span className="text-[11px] text-stone-500 mt-1 truncate max-w-[80%]">
              {locationLabel}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Region & State Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {destination.stateName && (
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-md border border-white/10">
              {destination.stateName}
            </span>
          )}
          {destination.region && (
            <span className="rounded-full bg-teal-950/70 px-2.5 py-1 text-xs font-medium text-teal-200 backdrop-blur-md border border-teal-500/20">
              {destination.region}
            </span>
          )}
        </div>

        {/* Bookmark Action */}
        <button
          onClick={toggleSave}
          aria-label="Save Destination"
          className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-md transition-colors ${
            isSaved
              ? 'bg-amber-500 text-white'
              : 'bg-black/40 text-white/90 hover:bg-black/60 hover:text-white'
          }`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>

        {/* Bottom overlay inside image: Name and Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="max-w-[75%]">
            <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-sm group-hover:text-amber-300 transition-colors line-clamp-1">
              {destination.destinationName}
            </h3>
            <p className="flex items-center text-xs text-stone-200 mt-0.5 truncate">
              <MapPin className="h-3 w-3 mr-1 shrink-0 text-amber-400" />
              <span className="truncate">{locationLabel}</span>
            </p>
          </div>
          {destination.popularityScore && (
            <div className="flex items-center rounded-lg bg-amber-500/90 px-2 py-1 text-xs font-bold text-stone-950 backdrop-blur-md shadow-sm">
              <Star className="h-3.5 w-3.5 fill-stone-950 mr-1" />
              {destination.popularityScore.toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Trip Type Tags */}
          {destination.tripTypes && destination.tripTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {destination.tripTypes.slice(0, 3).map((type, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200"
                >
                  {type}
                </span>
              ))}
            </div>
          )}

          {/* Description Snippet */}
          <p className="line-clamp-2 text-xs text-stone-600 leading-relaxed mb-3">
            {destination.description || `Explore the attractions and cultural highlights of ${destination.destinationName}.`}
          </p>
        </div>

        {/* Footer info: Budget & Season */}
        <div className="border-t border-stone-100 pt-2.5 flex items-center justify-between text-xs text-stone-500">
          <div>
            {destination.budgetIndicator ? (
              <span className="font-semibold text-teal-800">
                {destination.budgetIndicator}
              </span>
            ) : (
              <span>Best: {destination.bestSeasons || 'Oct - Mar'}</span>
            )}
          </div>
          <div className="flex items-center text-indigo-900 font-semibold group-hover:translate-x-0.5 transition-transform">
            Explore &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}
