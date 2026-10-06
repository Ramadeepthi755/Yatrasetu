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
  const extractHost = (item: RecommendedGuide | LocalHost): LocalHost => {
    if ('guide' in item && item.guide) {
      return item.guide;
    }
    return item as LocalHost;
  };

  const sortedGuides = [...guides].sort((a, b) => {
    const hostA = extractHost(a);
    const hostB = extractHost(b);
    const isRaviA = hostA?.name?.toLowerCase().includes('ravi kumar');
    const isRaviB = hostB?.name?.toLowerCase().includes('ravi kumar');
    if (isRaviA && !isRaviB) return -1;
    if (!isRaviA && isRaviB) return 1;
    return 0;
  });

  const displayGuides = sortedGuides.slice(0, 3);
  const hasMore = sortedGuides.length > 3;

  // Fallback avatars
  const avatarList = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-900" />
          <span>Local Guides</span>
        </h2>

        {hasMore ? (
          <Link
            href={`/connect?destinationId=${encodeURIComponent(destination.id)}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/connect"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
          >
            <span>Find Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      {displayGuides.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center">
          <ShieldCheck className="h-7 w-7 text-teal-600/70 mb-2" />
          <h4 className="text-xs font-bold text-stone-800">
            No registered guides in this area yet
          </h4>
          <p className="text-[11px] text-stone-500 max-w-xs mt-1">
            Verified local hosts from nearby cultural hubs will be matched as they become active.
          </p>
          <Link
            href="/connect"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:underline"
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
                className="group flex flex-col rounded-2xl border border-stone-200/80 bg-stone-50/50 p-3 hover:shadow-md hover:border-indigo-300 transition-all duration-200 justify-between"
              >
                <div>
                  {/* Avatar & Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <img
                      src={avatar}
                      alt={name}
                      className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-indigo-900 transition-colors">
                        {name}
                      </h3>
                      {isVerified && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified Guide</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role / Specialization */}
                  <p className="text-[11px] font-medium text-stone-700 line-clamp-1">
                    {role}
                  </p>

                  {/* Languages */}
                  <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                    {languages}
                  </p>
                </div>

                {/* Rating & Action Button */}
                <div className="pt-2 mt-2 border-t border-stone-200/60 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{rating}</span>
                    <span className="text-[10px] font-normal text-stone-400">({reviews})</span>
                  </div>

                  <Link
                    href={`/local/${encodeURIComponent(hostId)}`}
                    className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-xl text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all shadow-xs border border-indigo-200"
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
