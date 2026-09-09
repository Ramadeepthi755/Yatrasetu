'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Clock, IndianRupee, Star, ArrowRight, Sparkles } from 'lucide-react';
import { ExperienceItem, DestinationDetail } from '@/lib/api';

interface TopExperiencesProps {
  destination: DestinationDetail;
  experiences?: ExperienceItem[];
}

export function TopExperiences({ destination, experiences = [] }: TopExperiencesProps) {
  // Helper for experience fallback image
  const getExperienceImage = (title: string, index: number, category?: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('temple') || lower.includes('heritage') || lower.includes('walk'))
      return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('coffee') || lower.includes('tea') || lower.includes('estate') || lower.includes('plantation'))
      return 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('tribal') || lower.includes('village') || lower.includes('culture') || lower.includes('craft'))
      return 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('trek') || lower.includes('nature') || lower.includes('waterfall') || lower.includes('cave'))
      return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';

    const stock = [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    ];
    return stock[index % stock.length];
  };

  const displayExperiences = experiences.slice(0, 3);
  const hasMore = experiences.length > 3;

  return (
    <div id="experiences-section" className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Compass className="h-5 w-5 text-amber-500" />
          <span>Top Experiences</span>
        </h2>

        {hasMore ? (
          <Link
            href={`/experiences?destinationId=${encodeURIComponent(destination.id)}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 dark:text-indigo-400 hover:text-indigo-950 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/experiences"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      {displayExperiences.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 p-6 text-center">
          <Sparkles className="h-7 w-7 text-amber-500/70 mb-2" />
          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
            No local experiences listed yet
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mt-1">
            New community-led guided tours and experiences are constantly added by verified hosts.
          </p>
          <Link
            href={`/plan-trip?destination=${encodeURIComponent(destination.id)}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Plan custom trip</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 flex-1">
          {displayExperiences.map((exp, idx) => {
            const expImg = exp.coverImageUrl || getExperienceImage(exp.title, idx, exp.category);
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
                className="group flex flex-col rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-2.5 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/50 transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-28 w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-700 mb-2">
                  <img
                    src={expImg}
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

                {/* Title & Host */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                      {exp.hostName ? `By ${exp.hostName}` : 'By Local Guide'}
                    </p>
                  </div>

                  {/* Meta: Duration, Price, Rating */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-2.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-stone-400" />
                        <span>{durationText}</span>
                      </span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{price}</span>
                      <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{rating}</span>
                      </span>
                    </div>

                    {/* Book Now Action */}
                    <Link
                      href={`/experiences/${encodeURIComponent(exp.id)}`}
                      className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-bold text-stone-900 dark:text-white bg-amber-400/90 hover:bg-amber-400 active:scale-95 transition-all shadow-sm"
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
