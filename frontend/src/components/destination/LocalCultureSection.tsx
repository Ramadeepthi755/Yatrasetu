'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Palette, Landmark, Store, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { getCulturalTraditionsByDestination, CulturalTraditionDto } from '@/lib/api';
import { CulturalTraditionCard } from '@/components/explore/CulturalTraditionCard';

export interface DestinationLocalCultureSectionProps {
  destinationId: string;
  destinationName?: string;
  className?: string;
}

export function DestinationLocalCultureSection({
  destinationId,
  destinationName,
  className = '',
}: DestinationLocalCultureSectionProps) {
  const [traditions, setTraditions] = useState<CulturalTraditionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDestinationTraditions() {
      if (!destinationId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getCulturalTraditionsByDestination(destinationId);
        if (res.success && res.data) {
          setTraditions(res.data);
        } else {
          setTraditions([]);
        }
      } catch (err: any) {
        console.error('Error loading destination cultural traditions:', err);
        setError('Unable to load local cultural traditions at this time.');
      } finally {
        setLoading(false);
      }
    }
    loadDestinationTraditions();
  }, [destinationId]);

  return (
    <section
      id="local-culture-section"
      className={`rounded-3xl border border-amber-200/80 dark:border-stone-800 bg-gradient-to-b from-amber-50/40 via-white to-stone-50/30 dark:from-stone-900/80 dark:via-stone-900 dark:to-stone-950 p-6 md:p-8 shadow-sm ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
            <Palette className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <span>Living Craft &amp; Heritage Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Local Culture &amp; Traditions
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Verified living crafts, traditional arts, and cultural heritage rooted in {destinationName || 'this destination'}.
          </p>
        </div>

        {traditions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Landmark className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
              <span>{traditions.length} Verified Tradition{traditions.length === 1 ? '' : 's'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 p-6 text-center text-xs text-rose-700 dark:text-rose-300">
          <p>{error}</p>
        </div>
      ) : traditions.length === 0 ? (
        // Strict geographic precision empty state — DO NOT spill other state traditions
        <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Local culture information is currently unavailable for this destination.
            </h4>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              We uphold strict geographic traceability and do not infer traditions from broader state boundaries. Verified cultural tradition records for {destinationName || 'this destination'} will appear as official documentation is linked.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/explore#local-culture-section"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 underline"
            >
              <span>Explore national cultural traditions directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {traditions.map((t) => (
            <CulturalTraditionCard key={t.id} tradition={t} />
          ))}
        </div>
      )}
    </section>
  );
}
