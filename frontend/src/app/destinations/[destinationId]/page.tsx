'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  getDestinationDetail,
  getDestinationPois,
  getDestinationHosts,
  getRecommendedGuides,
  getDestinationExperiences,
  getDestinationHotels,
  getDestinationFood,
  DestinationDetail,
  PoiItem,
  LocalHost,
  RecommendedGuide,
  ExperienceItem,
  HotelItem,
  FamousFoodItem,
} from '@/lib/api';
import { DestinationHero } from '@/components/destination/DestinationHero';
import { MustVisitPlaces } from '@/components/destination/MustVisitPlaces';
import { QuickFacts } from '@/components/destination/QuickFacts';
import { TopExperiences } from '@/components/destination/TopExperiences';
import { RecommendedGuides } from '@/components/destination/RecommendedGuides';
import { WhereToStay } from '@/components/destination/WhereToStay';
import { LocalFood } from '@/components/destination/LocalFood';
import { DestinationMap } from '@/components/destination/DestinationMap';
import { DestinationCTA } from '@/components/destination/DestinationCTA';

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.destinationId as string;

  const [destination, setDestination] = useState<DestinationDetail | null>(null);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [guides, setGuides] = useState<(RecommendedGuide | LocalHost)[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [foods, setFoods] = useState<FamousFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDestinationData() {
      if (!destinationId) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch core destination detail
        const destRes = await getDestinationDetail(destinationId);
        if (!destRes.success || !destRes.data) {
          setError('Destination Not Found');
          setLoading(false);
          return;
        }

        const destData = destRes.data;
        setDestination(destData);

        // Fetch scoped sub-resources in parallel
        const [poisRes, recGuidesRes, hostsRes, expRes, hotelsRes, foodRes] = await Promise.allSettled([
          getDestinationPois(destinationId),
          getRecommendedGuides(destinationId),
          getDestinationHosts(destinationId),
          getDestinationExperiences(destinationId),
          getDestinationHotels(destinationId),
          getDestinationFood(destinationId),
        ]);

        // POIs
        if (poisRes.status === 'fulfilled' && poisRes.value.success && poisRes.value.data) {
          setPois(poisRes.value.data);
        } else if (destData.topPois && destData.topPois.length > 0) {
          setPois(destData.topPois);
        }

        // Guides (prefer recommendGuides, fallback to hosts)
        let resolvedGuides: (RecommendedGuide | LocalHost)[] = [];
        if (recGuidesRes.status === 'fulfilled' && recGuidesRes.value.success && recGuidesRes.value.data && recGuidesRes.value.data.length > 0) {
          resolvedGuides = recGuidesRes.value.data;
        } else if (hostsRes.status === 'fulfilled' && hostsRes.value.success && hostsRes.value.data && hostsRes.value.data.length > 0) {
          resolvedGuides = hostsRes.value.data;
        }
        setGuides(resolvedGuides);

        // Experiences
        if (expRes.status === 'fulfilled' && expRes.value.success && expRes.value.data) {
          setExperiences(expRes.value.data);
        }

        // Hotels (strictly scoped to this destination)
        if (hotelsRes.status === 'fulfilled' && hotelsRes.value.success && hotelsRes.value.data) {
          setHotels(hotelsRes.value.data);
        } else if (destData.nearbyHotels && destData.nearbyHotels.length > 0) {
          setHotels(destData.nearbyHotels);
        }

        // Food
        if (foodRes.status === 'fulfilled' && foodRes.value.success && foodRes.value.data) {
          setFoods(foodRes.value.data);
        }
      } catch (err: any) {
        console.error('Error loading destination details:', err);
        setError('Destination Not Found');
      } finally {
        setLoading(false);
      }
    }

    loadDestinationData();
  }, [destinationId]);

  // Loading State with matching Skeleton Layout
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Skeleton Hero */}
        <div className="h-80 w-full rounded-3xl bg-stone-200 dark:bg-stone-800" />

        {/* Skeleton Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-64 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="lg:col-span-5 h-64 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Skeleton Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-60 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-60 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Skeleton Row 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
    );
  }

  // Error / 404 State
  if (error || !destination) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 text-center shadow-lg space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Destination Not Found
          </h2>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            The destination you are looking for does not exist or may have been updated in our national tourism catalog.
          </p>

          <div className="pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 transition-all shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Explore</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 py-6 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* SECTION 1 — DESTINATION HERO */}
      <DestinationHero destination={destination} />

      {/* SECTION 2 — MUST-VISIT (60%) + QUICK FACTS (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <MustVisitPlaces destination={destination} pois={pois} />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <QuickFacts destination={destination} />
        </div>
      </div>

      {/* SECTION 3 — EXPERIENCES (50%) + LOCAL GUIDES (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col">
          <TopExperiences destination={destination} experiences={experiences} />
        </div>
        <div className="flex flex-col">
          <RecommendedGuides destination={destination} guides={guides} />
        </div>
      </div>

      {/* SECTION 4 — STAYS (33%) + FOOD (33%) + MAP (33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="flex flex-col">
          <WhereToStay destination={destination} hotels={hotels} />
        </div>
        <div className="flex flex-col">
          <LocalFood destination={destination} foods={foods} />
        </div>
        <div className="flex flex-col">
          <DestinationMap destination={destination} pois={pois} />
        </div>
      </div>

      {/* SECTION 5 — COMPACT FINAL CTA / RESPONSIBLE TOURISM */}
      <DestinationCTA destination={destination} />
    </div>
  );
}
