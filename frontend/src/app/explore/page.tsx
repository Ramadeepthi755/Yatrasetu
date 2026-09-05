'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Compass,
  MapPin,
  TrendingUp,
  Eye,
  Building2,
  Landmark,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getDestinations,
  getFeaturedDestinations,
  getTrendingDestinations,
  getHiddenGems,
  getStates,
  DestinationSummary,
  StateSummary,
} from '@/lib/api';
import { SearchBar } from '@/components/explore/SearchBar';
import { FilterBar } from '@/components/explore/FilterBar';
import { DestinationCard } from '@/components/explore/DestinationCard';
import { StateCard } from '@/components/explore/StateCard';
import { LocationDiscovery } from '@/components/explore/LocationDiscovery';
import { DestinationCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialRegion = searchParams.get('region') || 'All';
  const initialState = searchParams.get('state') || 'All';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [featured, setFeatured] = useState<DestinationSummary[]>([]);
  const [trending, setTrending] = useState<DestinationSummary[]>([]);
  const [hiddenGems, setHiddenGems] = useState<DestinationSummary[]>([]);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Initial metadata
  useEffect(() => {
    async function loadMeta() {
      try {
        const [statesRes, featRes, trendRes, gemsRes] = await Promise.all([
          getStates(),
          getFeaturedDestinations(4),
          getTrendingDestinations(6),
          getHiddenGems(6),
        ]);
        if (statesRes.success) setStates(statesRes.data);
        if (featRes.success) setFeatured(featRes.data);
        if (trendRes.success) setTrending(trendRes.data);
        if (gemsRes.success) setHiddenGems(gemsRes.data);
      } catch (err) {
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch filtered destinations
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      setError(null);
      try {
        const res = await getDestinations({
          stateId: selectedState !== 'All' ? selectedState : undefined,
          region: selectedRegion !== 'All' ? selectedRegion : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery.trim() !== '' ? searchQuery.trim() : undefined,
          size: 30,
        });

        if (res.success && res.data) {
          setDestinations(res.data.content);
          setTotalCount(res.data.totalElements);
        }
      } catch (err: any) {
        console.error('Error fetching destinations:', err);
        setError('Unable to load destinations right now. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchFiltered();
  }, [searchQuery, selectedRegion, selectedState, selectedCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedRegion !== 'All' ||
    selectedState !== 'All' ||
    selectedCategory !== 'All';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
    setSelectedState('All');
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20">
      {/* 1. Hero Discovery Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-stone-900 py-16 md:py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md border border-amber-500/20 mb-6">
            <Compass className="h-4 w-4 text-amber-400" />
            <span>Discover India &bull; 39 States &amp; UTs &bull; 202 Cities &bull; 164 Curated Destinations</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Explore India
          </h1>
          <p className="mt-4 text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Discover places, experiences and journeys across India.
          </p>

          {/* Search Bar in Hero */}
          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar
              initialQuery={searchQuery}
              onSearchSubmit={(q) => setSearchQuery(q)}
              placeholder="Search destinations, cities, experiences, hotels..."
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        {/* 2. Filter & Facets Bar */}
        <FilterBar
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          statesList={states}
          totalResults={totalCount}
        />

        {/* 3. Nearby Geolocation Section */}
        <div className="mt-10">
          <LocationDiscovery />
        </div>

        {/* 4. Filtered Destinations or Curated Showcase */}
        {hasActiveFilters ? (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  Search & Filter Results
                </h2>
                <p className="text-sm text-stone-500">
                  Found {totalCount} matching destination{totalCount === 1 ? '' : 's'}
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
              >
                Clear all filters
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <DestinationCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-700">
                <p>{error}</p>
                <button
                  onClick={() => setSearchQuery(searchQuery)}
                  className="mt-3 rounded-lg bg-rose-600 px-4 py-1.5 text-xs text-white"
                >
                  Retry
                </button>
              </div>
            ) : destinations.length === 0 ? (
              <EmptyState
                title="No destinations found"
                description="We couldn't find any destinations matching your criteria. Try adjusting your filters."
                onReset={clearAllFilters}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {destinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="mt-14 space-y-16">
            {/* Section 1: Popular / Featured Destinations */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Curated Highlights</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
                      Popular Destinations
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featured.map((dest) => (
                    <DestinationCard key={dest.id} destination={dest} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: Explore by Region */}
            <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">
                <Compass className="h-4 w-4" />
                <span>Geographic Diversity</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-6">
                Explore India by Region
              </h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { name: 'North India', desc: 'Himalayas & Heritage', color: 'from-amber-600 to-indigo-900' },
                  { name: 'South India', desc: 'Backwaters & Temples', color: 'from-teal-600 to-emerald-900' },
                  { name: 'West India', desc: 'Beaches & Forts', color: 'from-orange-500 to-rose-900' },
                  { name: 'East India', desc: 'Culture & Nature', color: 'from-cyan-600 to-blue-950' },
                  { name: 'North East India', desc: 'Living Bridges & Valleys', color: 'from-emerald-600 to-teal-950' },
                  { name: 'Central India', desc: 'Wildlife & Forests', color: 'from-amber-700 to-stone-900' },
                ].map((reg) => (
                  <button
                    key={reg.name}
                    onClick={() => setSelectedRegion(reg.name)}
                    className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-left transition-all hover:-translate-y-1 hover:border-amber-400 hover:bg-white hover:shadow-md"
                  >
                    <div>
                      <h4 className="font-bold text-stone-900 group-hover:text-indigo-950 text-sm">
                        {reg.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1">{reg.desc}</p>
                    </div>
                    <span className="mt-3 text-xs font-semibold text-indigo-900 group-hover:translate-x-1 transition-transform">
                      Browse &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Section 3: Explore by State */}
            {states.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 mb-1">
                      <Landmark className="h-4 w-4" />
                      <span>State & Union Territory Circuits</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
                      Explore by State
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {states.slice(0, 8).map((state) => (
                    <StateCard key={state.id} state={state} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 4: Hidden Gems & Lesser-Known Destinations */}
            {hiddenGems.length > 0 && (
              <section className="rounded-3xl bg-gradient-to-br from-stone-900 via-indigo-950 to-slate-950 p-6 md:p-10 text-white shadow-xl">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  <Eye className="h-4 w-4" />
                  <span>Off the Beaten Path</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
                  Hidden & Lesser-Known Gems
                </h2>
                <p className="text-sm text-stone-300 max-w-2xl mb-8">
                  Authentic, peaceful sanctuaries and secret corners documented by local observers and community hosts.
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {hiddenGems.map((dest) => (
                    <DestinationCard key={dest.id} destination={dest} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 5: Trending & Highly-Rated */}
            {trending.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>High Satisfaction Rating</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
                      Trending Destinations
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {trending.map((dest) => (
                    <DestinationCard key={dest.id} destination={dest} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
