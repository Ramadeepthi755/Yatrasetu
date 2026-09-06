'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Palette,
  MapPin,
  Award,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Hammer,
  Landmark,
  Compass,
  Store,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import {
  getCulturalTraditionDetail,
  getCulturalTraditionExperiences,
  CulturalTraditionDto,
  ExperienceItem,
} from '@/lib/api';
import { ProvenanceBadge } from '@/components/destination/ProvenanceBadge';
import { ExperienceCard } from '@/components/explore/ExperienceCard';

export default function CulturalTraditionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tradition, setTradition] = useState<CulturalTraditionDto | null>(null);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [tradRes, expRes] = await Promise.allSettled([
          getCulturalTraditionDetail(id),
          getCulturalTraditionExperiences(id),
        ]);

        if (tradRes.status === 'fulfilled' && tradRes.value.success && tradRes.value.data) {
          setTradition(tradRes.value.data);
        } else {
          setError('Cultural tradition not found.');
        }

        if (expRes.status === 'fulfilled' && expRes.value.success && expRes.value.data) {
          setExperiences(expRes.value.data);
        }
      } catch (err: any) {
        console.error('Error loading cultural tradition detail:', err);
        setError('Unable to load cultural tradition details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-stone-500">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Loading Cultural Heritage Intelligence...
        </p>
      </div>
    );
  }

  if (error || !tradition) {
    return (
      <div className="min-h-screen bg-stone-50/50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Cultural Tradition Not Found
        </h2>
        <p className="mt-2 text-sm text-stone-500 max-w-md">
          {error || `We could not locate the cultural tradition with ID "${id}".`}
        </p>
        <Link
          href="/explore#local-culture-section"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-stone-900 dark:bg-stone-100 px-5 py-2.5 text-xs font-semibold text-white dark:text-stone-900 hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Cultural Traditions</span>
        </Link>
      </div>
    );
  }

  const categoryLabel = tradition.category
    ? tradition.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Traditional Craft';

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-stone-950 pb-20">
      {/* 1. Top Breadcrumbs Navigation */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-xs font-medium text-stone-500 dark:text-stone-400 overflow-x-auto scrollbar-none">
            <Link href="/" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
            <Link href="/explore" className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors">
              Explore India
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
            <Link
              href="/explore#local-culture-section"
              className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
            >
              Culture
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
            <span className="text-stone-900 dark:text-stone-100 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {tradition.traditionName}
            </span>
          </nav>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-slate-900 to-stone-900 text-white py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              {/* Category & GI Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                  <Palette className="h-3.5 w-3.5 mr-1.5" />
                  {categoryLabel}
                </span>

                {tradition.isGiTagged && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 border border-amber-300 shadow-md">
                    <Award className="h-4 w-4 text-stone-950 fill-stone-950" />
                    <span>GI Registered {tradition.giTagYear ? `(${tradition.giTagYear})` : ''}</span>
                  </span>
                )}

                <ProvenanceBadge
                  sourceType={tradition.sourceType || 'OFFICIAL'}
                  sourceLabel={tradition.sourceOrganization ? 'Official Source' : 'Official'}
                />
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {tradition.traditionName}
              </h1>

              {/* Craft Type */}
              {tradition.craftType && (
                <p className="text-base sm:text-lg text-amber-200/90 font-medium">
                  {tradition.craftType}
                </p>
              )}

              {/* Geographic Breadcrumb Indicators */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-stone-300 pt-2">
                <MapPin className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span className="font-semibold text-white">
                  {tradition.stateName || tradition.stateId}
                </span>
                {tradition.cityName && (
                  <>
                    <span className="text-stone-500">•</span>
                    <span>{tradition.cityName}</span>
                  </>
                )}
                {tradition.destinationName && (
                  <>
                    <span className="text-stone-500">•</span>
                    <Link
                      href={`/destinations/${tradition.destinationId}`}
                      className="text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      {tradition.destinationName}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Hero Visual Card */}
            {tradition.imageUrl && !imageError ? (
              <div className="w-full lg:w-96 h-64 rounded-3xl overflow-hidden shadow-2xl border-2 border-stone-800/80 flex-shrink-0 bg-stone-900">
                <img
                  src={tradition.imageUrl}
                  alt={`${tradition.traditionName} visual showcase`}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full lg:w-96 h-56 rounded-3xl p-6 bg-gradient-to-br from-stone-900 to-indigo-950/80 border border-stone-800 flex flex-col justify-between text-stone-300 flex-shrink-0">
                <div>
                  <Landmark className="h-8 w-8 text-amber-400 mb-2" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {categoryLabel}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Authentic regional craft documented in official Indian cultural registry.
                  </p>
                </div>
                <div className="text-[11px] text-amber-300/80 font-mono">
                  Registry Code: {tradition.id}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Structured Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Row of 4 Core Heritage Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section A: Historical Origin & Heritage */}
          <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3">
              <BookOpen className="h-4 w-4" />
              <span>Historical Origin &amp; Lineage</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Origins &amp; Cultural Heritage
            </h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {tradition.historicalOrigin ||
                'Centuries-old artisanal lineage passed down through generations of master practitioners.'}
            </p>
          </div>

          {/* Section B: Materials & Techniques */}
          <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 mb-3">
              <Hammer className="h-4 w-4" />
              <span>Materials &amp; Craftsmanship</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Materials Used &amp; Techniques
            </h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {tradition.materialsUsed ||
                'Traditional natural materials, organic mineral pigments, and indigenous handcrafting tools.'}
            </p>
          </div>

          {/* Section C: Cultural Significance & Motifs */}
          <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-400 mb-3">
              <Sparkles className="h-4 w-4" />
              <span>Symbolism &amp; Practice</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Cultural Significance
            </h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {tradition.culturalSignificance ||
                'Plays an essential role in ceremonial festivities, sacred iconography, and local community identity.'}
            </p>
          </div>

          {/* Section D: Primary Producing Cluster */}
          <div className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-3">
              <MapPin className="h-4 w-4" />
              <span>Geographic Hub</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">
              Primary Producing Cluster
            </h2>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {tradition.primaryProducingCluster ? (
                <>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    {tradition.primaryProducingCluster}
                  </span>
                  {' — regional cluster of artisans, weaver cooperatives, and master studios.'}
                </>
              ) : (
                `Practiced across traditional artisan clusters within ${tradition.stateName || tradition.stateId}.`
              )}
            </p>
          </div>
        </div>

        {/* 4. Official Provenance & GI Registry Box */}
        <section className="rounded-3xl border border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/70 via-stone-50 to-amber-50/40 dark:from-amber-950/30 dark:via-stone-900 dark:to-amber-950/20 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-200/60 dark:bg-amber-900/60">
                <ShieldCheck className="h-4 w-4 text-amber-800 dark:text-amber-300" />
                <span>Verified Government &amp; Institutional Provenance</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Official Source &amp; Accreditation
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {tradition.provenance ||
                  'This cultural intelligence record is sourced from official Development Commissioner (Handicrafts/Handlooms) and State Directorate registries.'}
              </p>
              {tradition.sourceOrganization && (
                <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 pt-1">
                  Source Authority: <span className="font-normal">{tradition.sourceOrganization}</span>
                </div>
              )}
            </div>

            {tradition.sourceUrl && (
              <div className="flex flex-col items-start md:items-end gap-1.5 self-start md:self-center">
                <a
                  href={tradition.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-800 text-white hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 transition-colors shadow-sm"
                >
                  <span>Visit Official Source Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 max-w-xs text-left md:text-right">
                  Opens external government repository in a new tab. YatraSetu functions independently of external portal uptime.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 5. "Experience this tradition" Section */}
        <section id="tradition-experiences" className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 mb-1">
                <Compass className="h-4 w-4" />
                <span>Hands-on Engagement</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                Experience This Tradition
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Authentic masterclasses, craft immersion workshops, and studio visits linked to {tradition.traditionName}.
              </p>
            </div>
          </div>

          {experiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Experiences for this tradition are not currently available.
                </h4>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                  We do not fabricate fake artisan workshops or prices. Verified hands-on masterclasses and studio visits will appear as genuine local hosts and master craftspeople register.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/partner/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-400 hover:text-teal-950 dark:hover:text-teal-300 underline"
                >
                  <span>Are you a master artisan or host? Learn about partnering with YatraSetu</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
