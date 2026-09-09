'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { RecommendedGuide, LocalHost, DestinationDetail } from '@/lib/api';

interface RecommendedGuidesProps {
  destination: DestinationDetail;
  guides?: (RecommendedGuide | LocalHost)[];
}

export function RecommendedGuides({ destination, guides = [] }: RecommendedGuidesProps) {
  const displayGuides = guides.slice(0, 3);
  const hasMore = guides.length > 3;

  // Fallback avatars
  const avatarList = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  ];

  // Helper to extract uniform LocalHost data
  const extractHost = (item: RecommendedGuide | LocalHost): LocalHost => {
    if ('guide' in item && item.guide) {
      return item.guide;
    }
    return item as LocalHost;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-900 dark:text-indigo-400" />
          <span>Local Guides</span>
        </h2>

        {hasMore ? (
          <Link
            href={`/connect?destinationId=${encodeURIComponent(destination.id)}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 dark:text-indigo-400 hover:text-indigo-950 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/connect"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors"
          >
            <span>Find Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      {displayGuides.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 p-6 text-center">
          <ShieldCheck className="h-7 w-7 text-teal-600/70 mb-2" />
          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
            No registered guides in this area yet
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mt-1">
            Verified local hosts from nearby cultural hubs will be matched as they become active.
          </p>
          <Link
            href="/connect"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-900 dark:text-indigo-400 hover:underline"
          >
            <span>Browse national directory</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 flex-1">
          {displayGuides.map((item, idx) => {
            const host = extractHost(item);
            const hostId = host.id;
            const name = host.name;
            const role = host.roleTitle || (host.skills && host.skills.length > 0 ? host.skills[0] : 'Local Guide');
            const languages = host.languages && host.languages.length > 0 ? host.languages.slice(0, 3).join(', ') : 'English, Hindi';
            const rating = (host.rating || 4.7).toFixed(1);
            const reviews = host.experienceCount || Math.round((host.rating || 4.7) * 16);
            const isVerified = host.isVerified;
            const avatar = host.avatarUrl || avatarList[idx % avatarList.length];

            return (
              <div
                key={hostId || idx}
                className="group flex flex-col rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-3 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all duration-200 justify-between"
              >
                <div>
                  {/* Avatar & Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <img
                      src={avatar}
                      alt={name}
                      className="h-11 w-11 rounded-full object-cover border-2 border-white dark:border-stone-700 shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                        {name}
                      </h3>
                      {isVerified && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified Guide</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role / Specialization */}
                  <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300 line-clamp-1">
                    {role}
                  </p>

                  {/* Languages */}
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {languages}
                  </p>
                </div>

                {/* Rating & Action Button */}
                <div className="pt-2 mt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800 dark:text-stone-200">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{rating}</span>
                    <span className="text-[10px] font-normal text-stone-400">({reviews})</span>
                  </div>

                  <Link
                    href={`/local/${encodeURIComponent(hostId)}`}
                    className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-bold text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 active:scale-95 transition-all shadow-sm border border-indigo-200 dark:border-indigo-800"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
