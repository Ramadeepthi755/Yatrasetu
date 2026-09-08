'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Bed, Filter, Map, Grid, RefreshCw, CheckCircle, AlertCircle, X, MapPin, Database, Info } from 'lucide-react';
import { getHotels, getHotelCategories, HotelItem } from '@/lib/api';
import { HotelCard } from '@/components/explore/HotelCard';
import { MapView, MapMarker } from '@/components/map/MapView';

function HotelsDirectoryContent() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialDestinationId = searchParams.get('destinationId') || '';
  const initialCityId = searchParams.get('cityId') || '';
  const initialSearch = searchParams.get('search') || '';

  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirectQuery = initialDestinationId ? `?destinationId=${initialDestinationId}` : '';
      router.push(`/login?redirect=${encodeURIComponent('/hotels' + redirectQuery)}`);
    }
  }, [authLoading, isAuthenticated, router, initialDestinationId]);

  // View toggle: 'grid' vs 'map'
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Filters
  const [search, setSearch] = useState<string>(initialSearch);
  const [destinationId, setDestinationId] = useState<string>(initialDestinationId);
  const [cityId, setCityId] = useState<string>(initialCityId);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPartnerOnly, setIsPartnerOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('hotelRating');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Synchronize when URL searchParams change
  useEffect(() => {
    const urlDest = searchParams.get('destinationId') || '';
    const urlCity = searchParams.get('cityId') || '';
    const urlSearch = searchParams.get('search') || '';
    if (urlDest !== destinationId) setDestinationId(urlDest);
    if (urlCity !== cityId) setCityId(urlCity);
    if (urlSearch && urlSearch !== search) setSearch(urlSearch);
  }, [searchParams, destinationId, cityId, search]);

  // Load distinct categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getHotelCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch {
        setCategories(['Heritage', 'Luxury', 'Boutique', 'Homestay', 'Resort', 'Budget']);
      }
    }
    loadCategories();
  }, []);

  const loadHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHotels({
        destinationId: destinationId || undefined,
        cityId: cityId || undefined,
        search: search.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        isPartnerProperty: isPartnerOnly ? true : undefined,
        sort: sortBy === 'priceAsc' ? 'pricePerNight' : sortBy === 'priceDesc' ? 'pricePerNight' : 'hotelRating',
        direction: sortBy === 'priceAsc' ? 'asc' : 'desc',
        page: currentPage,
        size: viewMode === 'map' ? 50 : 12,
      });

      if (res.success && res.data) {
        setHotels(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load hotels';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [destinationId, cityId, search, selectedCategory, isPartnerOnly, sortBy, currentPage, viewMode]);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadHotels();
  };

  const handleReset = () => {
    setSearch('');
    setDestinationId('');
    setCityId('');
    setSelectedCategory('all');
    setIsPartnerOnly(false);
    setSortBy('hotelRating');
    setCurrentPage(0);
  };

  // Convert hotels into MapMarkers for Leaflet
  const mapMarkers: MapMarker[] = hotels
    .filter((h) => h.latitude && h.longitude && !isNaN(h.latitude) && !isNaN(h.longitude))
    .map((h) => ({
      id: h.id,
      title: h.hotelName,
      subtitle: `${h.category || 'Hotel'} · ₹${Number(h.pricePerNight).toLocaleString('en-IN')}/night (Indicative)`,
      latitude: Number(h.latitude),
      longitude: Number(h.longitude),
      type: 'hotel',
      linkUrl: `/hotels/${h.id}`,
    }));

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-stone-900 py-16 text-white sm:py-20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20 mb-4">
              <Bed className="h-3.5 w-3.5 mr-1.5" />
              Accommodations & Havelis Directory
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Stay in Heritage Havelis & Authentic Homestays
            </h1>
            <p className="mt-4 text-base text-stone-300 sm:text-lg leading-relaxed">
              Explore authentic regional stays, heritage estates, and boutique homestays curated across Indian destinations.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hotels by property name, city, or address in current dataset..."
                className="w-full rounded-xl border border-stone-700 bg-stone-800/90 py-3 pl-10 pr-4 text-sm text-white placeholder-stone-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 shadow-md flex items-center"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Transparent Notice Banner */}
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/90 p-4 text-xs text-indigo-900 shadow-sm backdrop-blur-md flex items-start gap-2.5">
          <Info className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Accommodation Coverage & Provenance Notice:</span> YatraSetu currently indexes 1,007 curated property records across 51 Indian cities. Listed rates represent baseline dataset estimates. Live real-time availability and dynamic rates will be powered directly through hotel partner integrations.
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          {/* Active Context Badges (if destinationId or cityId active) */}
          {(destinationId || cityId) && (
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-100 text-xs">
              <span className="text-stone-500 font-medium flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-amber-500" /> Location Filter:
              </span>
              {destinationId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-900 border border-indigo-200">
                  Destination: {destinationId}
                  <button
                    onClick={() => {
                      setDestinationId('');
                      setCurrentPage(0);
                    }}
                    className="ml-1 hover:text-rose-600"
                    title="Remove destination filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {cityId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 border border-teal-200">
                  City: {cityId}
                  <button
                    onClick={() => {
                      setCityId('');
                      setCurrentPage(0);
                    }}
                    className="ml-1 hover:text-rose-600"
                    title="Remove city filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(0);
              }}
              className={`rounded-full px-4 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Types
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(0);
                }}
                className={`rounded-full px-4 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub Row: Partner filter, View Toggle, Sort */}
          <div className="flex flex-wrap items-center justify-between border-t border-stone-100 pt-3 text-xs gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-stone-500 flex items-center mr-1">
                <Filter className="h-3.5 w-3.5 mr-1" /> Filters:
              </span>

              {/* Partner Toggle */}
              <button
                onClick={() => {
                  setIsPartnerOnly(!isPartnerOnly);
                  setCurrentPage(0);
                }}
                className={`flex items-center rounded-lg px-3 py-1.5 font-medium transition-colors border ${
                  isPartnerOnly
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1 text-teal-600" />
                Partner Properties Only
              </button>

              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-700 focus:border-indigo-400 focus:outline-none"
              >
                <option value="hotelRating">Highest Rating</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>

              {(search || destinationId || cityId || selectedCategory !== 'all' || isPartnerOnly || sortBy !== 'hotelRating') && (
                <button
                  onClick={handleReset}
                  className="flex items-center text-xs text-indigo-700 hover:text-indigo-800 font-medium ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Reset
                </button>
              )}
            </div>

            {/* Right: View Mode Toggle (Grid vs Map) */}
            <div className="flex items-center space-x-1 rounded-xl bg-stone-100 p-1 border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Grid className="h-3.5 w-3.5 mr-1" /> Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Map className="h-3.5 w-3.5 mr-1" /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4 flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Showing <strong className="text-stone-900">{hotels.length}</strong> properties in YatraSetu dataset
            {totalElements > 0 && <span> of <strong>{totalElements}</strong> total</span>}
          </span>
          {viewMode === 'grid' && totalPages > 1 && (
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
                className="h-44 rounded-2xl border border-stone-200 bg-white p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="h-4 w-3/4 rounded bg-stone-200" />
                <div className="h-3 w-1/2 rounded bg-stone-100" />
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
              onClick={loadHotels}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hotels.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <Bed className="mx-auto h-12 w-12 text-stone-400 mb-3" />
            <h3 className="text-base font-bold text-stone-900">No properties matched your criteria in YatraSetu&apos;s dataset</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Try choosing another accommodation category or resetting the location filters.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-xl bg-indigo-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View Mode: Map vs Grid */}
        {!loading && !error && hotels.length > 0 && (
          <>
            {viewMode === 'map' ? (
              <div className="space-y-6">
                <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                  <MapView
                    markers={mapMarkers}
                    zoom={6}
                    className="h-[560px] w-full rounded-2xl overflow-hidden"
                    title="Explore Properties on Map"
                    subtitle="Click any pin to inspect indicative rates, category, and property details"
                  />
                </div>

                {/* Sub-grid of hotels underneath map */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hotels.slice(0, 6).map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination (Grid mode only) */}
        {!loading && viewMode === 'grid' && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center space-x-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Previous
            </button>
            <span className="text-xs text-stone-600 font-medium">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function HotelsDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="animate-pulse text-xs font-semibold uppercase tracking-wider text-stone-400">
            Loading Accommodations...
          </div>
        </div>
      }
    >
      <HotelsDirectoryContent />
    </Suspense>
  );
}
