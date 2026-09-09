'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Compass,
  Calendar,
  Sparkles,
  Mountain,
  Landmark,
  Coffee,
  Train,
  TreePine,
  Waves,
  Sun,
  Flame,
  Camera,
  Heart,
  Share2,
} from 'lucide-react';
import { DestinationDetail } from '@/lib/api';

interface DestinationHeroProps {
  destination: DestinationDetail;
  onExploreExperiences?: () => void;
  onPlanTrip?: () => void;
}

export function DestinationHero({
  destination,
  onExploreExperiences,
  onPlanTrip,
}: DestinationHeroProps) {
  const router = useRouter();

  // Helper for dynamic highlight chip icons
  const getTagIcon = (tag: string) => {
    const lower = tag.toLowerCase();
    if (lower.includes('hill') || lower.includes('mountain')) return <Mountain className="h-3.5 w-3.5 text-amber-400" />;
    if (lower.includes('temple') || lower.includes('heritage') || lower.includes('tribal') || lower.includes('monument'))
      return <Landmark className="h-3.5 w-3.5 text-amber-400" />;
    if (lower.includes('coffee') || lower.includes('tea') || lower.includes('plantation'))
      return <Coffee className="h-3.5 w-3.5 text-amber-400" />;
    if (lower.includes('rail') || lower.includes('train') || lower.includes('scenic'))
      return <Train className="h-3.5 w-3.5 text-amber-400" />;
    if (lower.includes('nature') || lower.includes('forest') || lower.includes('wildlife') || lower.includes('waterfall'))
      return <TreePine className="h-3.5 w-3.5 text-emerald-400" />;
    if (lower.includes('beach') || lower.includes('sea') || lower.includes('lake'))
      return <Waves className="h-3.5 w-3.5 text-cyan-400" />;
    if (lower.includes('adventure') || lower.includes('trek'))
      return <Flame className="h-3.5 w-3.5 text-orange-400" />;
    return <Sparkles className="h-3.5 w-3.5 text-amber-400" />;
  };

  // Extract themes
  const tripTypes = destination.tripTypes || [];
  const primaryTheme1 = tripTypes[0] || destination.region || 'Heritage';
  const primaryTheme2 = tripTypes[1] || (tripTypes.length > 0 ? tripTypes[0] : 'Culture');

  // Compute rating & review count
  const rating = destination.popularityScore
    ? Math.min(5.0, Math.max(3.8, Number((destination.popularityScore / 2).toFixed(1))))
    : 4.6;
  const reviewCount = (destination.popularityScore ? Math.round(destination.popularityScore * 24) : 120) + '+';

  // Highlight tags (limit to 4)
  const highlightTags = [
    ...(destination.tripTypes || []),
    ...(destination.activitiesAvailable || []),
  ]
    .map((t) => t.replace(/_/g, ' '))
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4);

  // Catchy tagline based on themes/region
  const getTagline = () => {
    if (destination.uniqueExperiences && destination.uniqueExperiences.length > 5 && destination.uniqueExperiences.length < 40) {
      return destination.uniqueExperiences;
    }
    const parts = [
      primaryTheme1.replace(/_/g, ' '),
      primaryTheme2.replace(/_/g, ' '),
      'Tranquility',
    ].filter(Boolean);
    return parts.slice(0, 3).join('. ') + '.';
  };

  const heroImage =
    destination.heroImageUrl ||
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-stone-900 shadow-xl border border-stone-800/80 mb-6">
      {/* Background Image with Dark Overlays */}
      <div
        className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col justify-between min-h-[360px] md:min-h-[400px]">
        {/* Top Bar: Back Button + Tagline */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-black/40 hover:bg-black/65 backdrop-blur-md border border-white/15 transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Explore</span>
          </Link>

          {/* Top Right Tagline Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-200 bg-emerald-950/40 backdrop-blur-md border border-emerald-500/20 italic">
            <TreePine className="h-3.5 w-3.5 text-emerald-400 not-italic" />
            <span>{getTagline()}</span>
          </div>
        </div>

        {/* Middle/Bottom: Destination Details & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mt-8">
          {/* Left Column (8 cols): Name, Badges, Description, Highlight Chips */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {destination.stateName && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm">
                  {destination.stateName}
                </span>
              )}
              {primaryTheme1 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium text-teal-100 bg-teal-900/60 backdrop-blur-md border border-teal-500/30">
                  {primaryTheme1.replace(/_/g, ' ')}
                </span>
              )}
              {primaryTheme2 && primaryTheme2 !== primaryTheme1 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium text-indigo-100 bg-indigo-900/60 backdrop-blur-md border border-indigo-500/30">
                  {primaryTheme2.replace(/_/g, ' ')}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 bg-black/50 backdrop-blur-md border border-amber-500/30">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{rating} ({reviewCount} reviews)</span>
              </span>
            </div>

            {/* Destination Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {destination.destinationName}
            </h1>

            {/* Concise Description */}
            <p className="text-sm md:text-base text-stone-200 max-w-3xl line-clamp-2 leading-relaxed drop-shadow">
              {destination.description ||
                `A magnificent destination in ${destination.stateName || 'India'} offering rich heritage, vibrant culture, and unforgettable travel experiences.`}
            </p>

            {/* Highlight Chips Row */}
            {highlightTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {highlightTags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-stone-200 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 transition-colors"
                  >
                    {getTagIcon(tag)}
                    <span className="capitalize">{tag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Action CTAs */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end lg:items-end">
            <button
              onClick={() => {
                if (onExploreExperiences) {
                  onExploreExperiences();
                } else {
                  const el = document.getElementById('experiences-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto lg:w-60 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-lg hover:shadow-amber-500/20"
            >
              <span>Explore Experiences</span>
              <Compass className="h-4 w-4" />
            </button>

            <Link
              href={`/plan-trip?destination=${encodeURIComponent(destination.id)}&name=${encodeURIComponent(destination.destinationName)}`}
              className="w-full sm:w-auto lg:w-60 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/20 transition-all shadow-md"
            >
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Plan a Trip</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
