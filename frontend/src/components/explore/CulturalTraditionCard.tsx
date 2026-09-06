'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, MapPin, Sparkles, Landmark, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { CulturalTraditionDto } from '@/lib/api';
import { ProvenanceBadge } from '@/components/destination/ProvenanceBadge';

export interface CulturalTraditionCardProps {
  tradition: CulturalTraditionDto;
  className?: string;
}

export function CulturalTraditionCard({ tradition, className = '' }: CulturalTraditionCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  // Format category name for human display
  const categoryLabel = tradition.category
    ? tradition.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Traditional Craft';

  // Category-specific color accents
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'HANDLOOM':
      case 'TEXTILE':
      case 'EMBROIDERY':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
      case 'METAL_CRAFT':
      case 'JEWELLERY':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/60';
      case 'PAINTING':
      case 'FOLK_ART':
        return 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60';
      case 'WOOD_CRAFT':
      case 'SCULPTURE':
        return 'bg-amber-50/80 text-amber-900 border-amber-200/80 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700';
      case 'POTTERY':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60';
      default:
        return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60';
    }
  };

  const description =
    tradition.culturalSignificance || tradition.historicalOrigin || 'Living craft tradition rooted in authentic regional heritage.';

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/80 hover:shadow-lg dark:hover:border-amber-500/50 ${className}`}
    >
      {/* Top Media / Visual Area */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-stone-800 via-stone-900 to-indigo-950">
        {tradition.imageUrl && !imageFailed ? (
          <img
            src={tradition.imageUrl}
            alt={`${tradition.traditionName} - ${tradition.craftType || categoryLabel}`}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white/90">
            <div className="mb-2 rounded-full bg-amber-500/20 p-3 text-amber-400 backdrop-blur-sm border border-amber-400/30">
              <Landmark className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
              {categoryLabel}
            </span>
            <span className="text-sm font-bold text-stone-200 mt-1 line-clamp-1">
              {tradition.traditionName}
            </span>
          </div>
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {/* Category Tag */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border shadow-sm backdrop-blur-md ${getCategoryTheme(
              tradition.category
            )}`}
          >
            {categoryLabel}
          </span>

          {/* GI Tag Badge (ONLY shown when is_gi_tagged === true) */}
          {tradition.isGiTagged && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 border border-amber-300 shadow-md backdrop-blur-md"
              title={`Geographical Indication (GI) Registered${tradition.giTagYear ? ` in ${tradition.giTagYear}` : ''}`}
            >
              <Award className="h-3.5 w-3.5 text-stone-950 fill-stone-950" />
              <span>GI Tagged {tradition.giTagYear ? `• ${tradition.giTagYear}` : ''}</span>
            </span>
          )}
        </div>

        {/* Craft Type Subtitle overlay on bottom of image */}
        {tradition.craftType && (
          <div className="absolute bottom-2.5 left-3 right-3">
            <span className="text-xs font-medium text-stone-200 drop-shadow-sm line-clamp-1">
              {tradition.craftType}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Tradition Name */}
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {tradition.traditionName}
          </h3>

          {/* Geographic Location Association */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {tradition.stateName || tradition.stateId}
            </span>
            {tradition.cityName && (
              <>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600 dark:text-stone-300">{tradition.cityName}</span>
              </>
            )}
            {tradition.destinationName && (
              <>
                <span className="text-stone-400">•</span>
                <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                  {tradition.destinationName}
                </span>
              </>
            )}
          </div>

          {/* Primary Cluster info if present */}
          {tradition.primaryProducingCluster && (
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
              <span className="font-medium text-stone-700 dark:text-stone-300">Hub: </span>
              {tradition.primaryProducingCluster}
            </p>
          )}

          {/* Short Factual Description */}
          <p className="mt-2.5 text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer with Provenance & Action Link */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <ProvenanceBadge
            sourceType={tradition.sourceType || 'OFFICIAL'}
            sourceLabel={tradition.sourceOrganization ? 'Official Source' : 'Official'}
          />

          <Link
            href={`/culture/${tradition.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Explore Heritage</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
