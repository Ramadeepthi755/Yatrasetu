'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, Compass } from 'lucide-react';
import { DestinationDetail } from '@/lib/api';

interface DestinationCTAProps {
  destination: DestinationDetail;
}

export function DestinationCTA({ destination }: DestinationCTAProps) {
  return (
    <div className="w-full rounded-3xl bg-stone-900 dark:bg-stone-950 text-white p-5 md:p-6 shadow-xl border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-5 mt-6">
      {/* Left: Responsible Tourism Indicator */}
      <div className="flex items-center gap-3.5 text-center md:text-left">
        <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-sm">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">
            Experience Responsible Tourism
          </h4>
          <p className="text-xs text-stone-300 mt-0.5">
            Support local communities • Respect nature • Travel responsibly
          </p>
        </div>
      </div>

      {/* Right: Call To Action Action */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
        <span className="text-sm font-semibold text-stone-200 hidden lg:inline-block">
          Ready to explore {destination.destinationName}?
        </span>

        <Link
          href={`/plan-trip?destination=${encodeURIComponent(destination.id)}&name=${encodeURIComponent(destination.destinationName)}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-lg hover:shadow-amber-500/20"
        >
          <span>Start Your Journey</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
