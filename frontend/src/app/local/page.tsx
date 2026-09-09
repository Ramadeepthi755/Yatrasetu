'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Compass, ShieldCheck, Filter, AlertCircle, RefreshCw, Sparkles, MapPin, Languages, CheckCircle } from 'lucide-react';
import { getLocalHosts, matchGuides, LocalHost, RecommendedGuide } from '@/lib/api';
import { LocalHostCard } from '@/components/explore/LocalHostCard';
import { RecommendedGuideCard } from '@/components/explore/RecommendedGuideCard';

export default function LocalHostsDirectoryPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialDestination = searchParams.get('destinationId') || '';

  const [hosts, setHosts] = useState<LocalHost[]>([]);
  const [recommendedGuides, setRecommendedGuides] = useState<RecommendedGuide[]>([]);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [relaxationSuggestions, setRelaxationSuggestions] = useState<string[]>([]);
  const [isMatchingMode, setIsMatchingMode] = useState<boolean>(Boolean(initialDestination));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirectQuery = initialDestination ? `?destinationId=${initialDestination}` : '';
      router.push(`/login?redirect=${encodeURIComponent('/local' + redirectQuery)}`);
    }
  }, [authLoading, isAuthenticated, router, initialDestination]);

  // Filter States
  const [destinationId, setDestinationId] = useState<string>(initialDestination);
  const [search, setSearch] = useState<string>('');
  const [selectedInterest, setSelectedInterest] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [skill, setSkill] = useState<string>('all');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('rating');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isMatchingMode || (destinationId && destinationId !== 'all') || selectedInterest !== 'all' || selectedLanguage !== 'all') {
        // Run explainable matching engine
        const res = await matchGuides({
          destinationId: destinationId && destinationId !== 'all' ? destinationId : undefined,
          interests: selectedInterest !== 'all' ? [selectedInterest] : undefined,
          languages: selectedLanguage !== 'all' ? [selectedLanguage] : undefined,
          skill: skill !== 'all' ? skill : undefined,
          verifiedOnly: isVerifiedOnly || undefined,
        });

        if (res.success && res.data) {
          setRecommendedGuides(res.data.matches);
          setMatchMessage(res.data.message);
          setRelaxationSuggestions(res.data.relaxationSuggestions || []);
          setTotalElements(res.data.matches.length);
          setTotalPages(1);
        }
      } else {
        const res = await getLocalHosts({
          search: search.trim() || undefined,
          skill: skill !== 'all' ? skill : undefined,
          isVerified: isVerifiedOnly ? true : undefined,
          sort: sortBy,
          direction: sortBy === 'pricePerHour' ? 'asc' : 'desc',
          page: currentPage,
          size: 12,
        });

        if (res.success && res.data) {
          setHosts(res.data.content);
          setRecommendedGuides([]);
          setMatchMessage(null);
          setRelaxationSuggestions([]);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load local hosts';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, skill, isVerifiedOnly, sortBy, currentPage, destinationId, selectedInterest, selectedLanguage, isMatchingMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMatchingMode(false);
    setCurrentPage(0);
    loadData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDestinationId('');
    setSelectedInterest('all');
    setSelectedLanguage('all');
    setSkill('all');
    setIsVerifiedOnly(false);
    setIsMatchingMode(false);
    setSortBy('rating');
    setCurrentPage(0);
  };

  const destinationOptions = [
    { label: 'All Destinations', value: 'all' },
    { label: 'Hyderabad (Telangana)', value: 'dest-101' },
    { label: 'Jaipur (Rajasthan)', value: 'dest-3' },
    { label: 'Varanasi (Uttar Pradesh)', value: 'dest-4' },
    { label: 'Hampi (Karnataka)', value: 'dest-14' },
    { label: 'Goa Coastal Belt', value: 'dest-1' },
    { label: 'Udaipur (Rajasthan)', value: 'dest-6' },
    { label: 'Agra (Uttar Pradesh)', value: 'dest-5' },
    { label: 'Kerala Backwaters', value: 'dest-7' },
  ];

  const interestOptions = [
    { label: 'All Interests', value: 'all' },
    { label: 'Heritage & History', value: 'Heritage' },
    { label: 'Culinary & Food', value: 'Food' },
    { label: 'Artisan & Crafts', value: 'Crafts' },
    { label: 'Architecture', value: 'Architecture' },
    { label: 'Spiritual & Sacred', value: 'Spiritual' },
    { label: 'Photography', value: 'Photography' },
    { label: 'Nature & Wildlife', value: 'Nature' },
  ];

  const languageOptions = [
    { label: 'All Languages', value: 'all' },
    { label: 'Telugu', value: 'Telugu' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'English', value: 'English' },
    { label: 'Urdu', value: 'Urdu' },
    { label: 'Kannada', value: 'Kannada' },
    { label: 'Rajasthani', value: 'Rajasthani' },
    { label: 'Tamil', value: 'Tamil' },
    { label: 'Malayalam', value: 'Malayalam' },
  ];

  const skillOptions = [
    { label: 'All Roles', value: 'all' },
    { label: 'Heritage Guides', value: 'Guide' },
    { label: 'Artisans & Crafts', value: 'Artisan' },
    { label: 'Culinary Hosts', value: 'Food' },
    { label: 'Storytellers', value: 'Storytelling' },
    { label: 'Naturalists', value: 'Naturalist' },
    { label: 'Photographers', value: 'Photography' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-stone-900 py-16 text-white sm:py-20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-4">
              <Compass className="h-3.5 w-3.5 mr-1.5" />
              YatraSetu Local Directory
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Meet Verified Local Guides & Hosts
            </h1>
            <p className="mt-4 text-base text-stone-300 sm:text-lg leading-relaxed">
              Connect with place-specific community historians, master craftspeople, and culinary custodians. Explainable recommendations matched to your destination and cultural interests.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by guide name, city, skill, or heritage keyword..."
                className="w-full rounded-xl border border-stone-700 bg-stone-800/90 py-3 pl-10 pr-4 text-sm text-white placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-stone-950 transition-colors hover:bg-amber-400 shadow-md flex items-center"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Tourist Interests & Destination Filter Card (Task 5) */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-stone-100 gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Explainable Guide Matching Engine
              </h2>
            </div>
            <span className="text-xs text-stone-500">
              Filter by place, language, and cultural focus
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Destination Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Destination
              </label>
              <select
                value={destinationId}
                onChange={(e) => {
                  setDestinationId(e.target.value);
                  setIsMatchingMode(true);
                  setCurrentPage(0);
                }}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 focus:border-amber-400 focus:outline-none"
              >
                {destinationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interest Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-600" /> Cultural Interest
              </label>
              <select
                value={selectedInterest}
                onChange={(e) => {
                  setSelectedInterest(e.target.value);
                  setIsMatchingMode(true);
                  setCurrentPage(0);
                }}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 focus:border-amber-400 focus:outline-none"
              >
                {interestOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-amber-600" /> Spoken Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setIsMatchingMode(true);
                  setCurrentPage(0);
                }}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 focus:border-amber-400 focus:outline-none"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Role / Skill */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-600" /> Role Type
              </label>
              <select
                value={skill}
                onChange={(e) => {
                  setSkill(e.target.value);
                  setIsMatchingMode(true);
                  setCurrentPage(0);
                }}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 focus:border-amber-400 focus:outline-none"
              >
                {skillOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsVerifiedOnly(!isVerifiedOnly);
                setCurrentPage(0);
              }}
              className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-bold transition-colors border ${
                isVerifiedOnly
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-teal-600" />
              YatraSetu Verified Only
            </button>

            {(destinationId || selectedInterest !== 'all' || selectedLanguage !== 'all' || skill !== 'all' || isVerifiedOnly || search) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center text-xs text-amber-700 hover:text-amber-800 font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset All Preferences
              </button>
            )}
          </div>
        </div>

        {/* Relaxation Suggestions Banner if no exact match (Task 5) */}
        {relaxationSuggestions.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-xs font-bold text-amber-950">
                  {matchMessage || 'No 100% exact match found for all combined filters.'}
                </p>
                <p className="text-xs text-amber-900">
                  Would you like to relax one of your preferences to see verified guides nearby?
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {relaxationSuggestions.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (sugg.includes('language')) setSelectedLanguage('all');
                        if (sugg.includes('interest') || sugg.includes('cultural')) setSelectedInterest('all');
                        if (sugg.includes('budget')) setSkill('all');
                      }}
                      className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
                    >
                      ✓ {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Counter */}
        <div className="mb-4 flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Showing <strong className="text-stone-900">{recommendedGuides.length || hosts.length}</strong> verified providers
          </span>
          {totalPages > 1 && (
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-stone-200 bg-white p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-full bg-stone-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-stone-200" />
                    <div className="h-3 w-1/2 rounded bg-stone-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-stone-100" />
                  <div className="h-3 w-5/6 rounded bg-stone-100" />
                </div>
                <div className="h-8 w-full rounded-xl bg-stone-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-bold text-red-800 mb-2">{error}</p>
            <button
              onClick={loadData}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendedGuides.length === 0 && hosts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <Compass className="mx-auto h-12 w-12 text-stone-400 mb-3" />
            <h3 className="text-base font-bold text-stone-900">No local guides matched your criteria</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Try relaxing your language or interest filter to discover verified local hosts in this region.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-400"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Grid View */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedGuides.length > 0
              ? recommendedGuides.map((item) => (
                  <RecommendedGuideCard key={item.guide.id} item={item} />
                ))
              : hosts.map((host) => (
                  <LocalHostCard key={host.id} host={host} />
                ))}
          </div>
        )}
      </main>
    </div>
  );
}
