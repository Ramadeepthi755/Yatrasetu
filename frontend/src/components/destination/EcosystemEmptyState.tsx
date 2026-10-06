'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, ArrowRight, Compass } from 'lucide-react';

export interface EcosystemEmptyStateProps {
  title: string;
  category: string;
  destinationName?: string;
  description?: string;
  showPartnerCta?: boolean;
}

export function EcosystemEmptyState({
  title,
  category,
  destinationName,
  description,
  showPartnerCta = true,
}: EcosystemEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-br from-white via-stone-50/50 to-amber-50/20 p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/20 text-xs font-semibold mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>Ecosystem Onboarding in Progress</span>
      </div>

      <h4 className="text-base sm:text-lg font-bold text-stone-900">
        {title || `More local partners are joining YatraSetu`}
      </h4>

      <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
        {description ||
          `Verified ${category.toLowerCase()} listings and curated hosts for ${destinationName || 'this destination'} are currently being onboarded to ensure authentic, trusted travel experiences.`}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#312E81] hover:bg-[#1E1B4B] text-white transition-all shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Explore Other Destinations</span>
        </Link>

        {showPartnerCta && (
          <Link
            href="/partner/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Join as Verified Partner</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
