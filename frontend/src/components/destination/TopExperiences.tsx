'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Clock, Star, ArrowRight, Sparkles, Trees, Mountain, Landmark, Utensils } from 'lucide-react';
import { ExperienceItem, DestinationDetail } from '@/lib/api';
import { resolveEntityImage } from '@/lib/imageResolver';

interface TopExperiencesProps {
  destination: DestinationDetail;
  experiences?: ExperienceItem[];
}

export function TopExperiences({ destination, experiences = [] }: TopExperiencesProps) {
  const displayExperiences = experiences.slice(0, 3);
  const hasMore = experiences.length > 3;

  const renderExperienceVisual = (exp: ExperienceItem) => {
    const imageUrl = resolveEntityImage({
      destinationName: destination.destinationName,
      entityName: exp.title,
      category: exp.category,
      entityType: 'experience',
      providedImageUrl: exp.coverImageUrl,
    });
    if (imageUrl) {
      return (
        <div className="relative h-28 w-full overflow-hidden rounded-xl bg-stone-200 mb-2">
          <img
            src={imageUrl}
            alt={exp.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {exp.category && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
              {exp.category}
            </span>
          )}
        </div>
      );
    }

    // Category-specific neutral placeholder
    const cat = (exp.category || '').toLowerCase();
    let Icon = Compass;
    let gradient = 'from-amber-500/20 via-orange-500/10 to-stone-100';

    if (cat.includes('nature') || cat.includes('wildlife')) {
      Icon = Trees;
      gradient = 'from-emerald-500/20 via-teal-500/10 to-stone-100';
    } else if (cat.includes('adventure') || cat.includes('trek')) {
      Icon = Mountain;
      gradient = 'from-indigo-500/20 via-purple-500/10 to-stone-100';
    } else if (cat.includes('culture') || cat.includes('heritage') || cat.includes('art')) {
      Icon = Landmark;
      gradient = 'from-rose-500/20 via-amber-500/10 to-stone-100';
    } else if (cat.includes('food') || cat.includes('culinary')) {
      Icon = Utensils;
      gradient = 'from-orange-500/20 via-amber-500/10 to-stone-100';
    }

    return (
      <div className={`relative h-28 w-full overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-stone-200/60 flex flex-col items-center justify-center p-3 mb-2 text-center`}>
        <div className="h-10 w-10 rounded-xl bg-white/90 shadow-xs flex items-center justify-center text-amber-600 mb-1">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
          {exp.category || 'Experience'}
        </span>
      </div>
    );
  };

  return (
    <div id="experiences-section" className="bg-white rounded-3xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
          <Compass className="h-5 w-5 text-amber-500" />
          <span>Top Experiences</span>
        </h2>

        {hasMore ? (
          <Link
            href={`/experiences?destinationId=${encodeURIComponent(destination.id)}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/experiences"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      {displayExperiences.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center">
          <Sparkles className="h-7 w-7 text-amber-500/70 mb-2" />
          <h4 className="text-xs font-bold text-stone-800">
            No local experiences listed yet
          </h4>
          <p className="text-[11px] text-stone-500 max-w-xs mt-1">
            New community-led guided tours and experiences are constantly added by verified hosts.
          </p>
          <Link
            href={`/plan-trip?destination=${encodeURIComponent(destination.id)}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline"
          >
            <span>Plan custom trip</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 flex-1">
          {displayExperiences.map((exp) => {
            const durationText = exp.durationHours
              ? exp.durationHours >= 8
                ? `${Math.round(exp.durationHours / 8)} day`
                : `${exp.durationHours} hours`
              : 'Half day';
            const price = exp.pricePerPerson ? `₹${exp.pricePerPerson.toLocaleString()}` : 'Free';
            const rating = exp.hostRating ? exp.hostRating.toFixed(1) : '4.8';

            return (
              <div
                key={exp.id}
                className="group flex flex-col rounded-2xl border border-stone-200/80 bg-stone-50/50 p-2.5 hover:shadow-md hover:border-amber-300 transition-all duration-200"
              >
                {/* Visual */}
                {renderExperienceVisual(exp)}

                {/* Title & Host */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                      {exp.hostName ? `By ${exp.hostName}` : 'By Local Guide'}
                    </p>
                  </div>

                  {/* Meta: Duration, Price, Rating */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-2.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-stone-400" />
                        <span>{durationText}</span>
                      </span>
                      <span className="font-bold text-stone-900">{price}</span>
                      <span className="inline-flex items-center gap-0.5 text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{rating}</span>
                      </span>
                    </div>

                    {/* Book Now Action */}
                    <Link
                      href={`/experiences/${encodeURIComponent(exp.id)}`}
                      className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-xs"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
