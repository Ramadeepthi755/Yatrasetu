'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  discoverTravelers,
  getDestinations,
  TravelerDiscovery,
  DestinationSummary,
} from '@/lib/api';
import TravelConnectNav from '@/components/travel-connect/TravelConnectNav';
import TravelBuddyCard from '@/components/travel-connect/TravelBuddyCard';
import SettingsModal from '@/components/travel-connect/SettingsModal';
import {
  Users,
  Compass,
  MapPin,
  Calendar,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
} from 'lucide-react';

function TravelConnectContent() {
  const searchParams = useSearchParams();
  const initialDestId = searchParams.get('destinationId') || '';

  const { token } = useAuth();

  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<string>(initialDestId);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [citySearch, setCitySearch] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [travelers, setTravelers] = useState<TravelerDiscovery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Load destinations for the dropdown
  useEffect(() => {
    const loadDests = async () => {
      try {
        const res = await getDestinations({ size: 60 });
        if (res.success && res.data) {
          setDestinations(res.data.content);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    };
    loadDests();
  }, []);

  // Fetch travelers based on filters
  const fetchTravelers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await discoverTravelers(
        {
          destinationId: selectedDestId || undefined,
          city: citySearch.trim() || undefined,
          travelStyle: selectedStyle !== 'all' ? selectedStyle : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          size: 24,
        },
        token || undefined
      );

      if (res.success && res.data) {
        setTravelers(res.data.content);
        setTotalCount(res.data.totalElements);
      } else {
        setError(res.message || 'Unable to load travelers.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to Travel Connect service.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelers();
  }, [selectedDestId, selectedStyle, fromDate, toDate, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTravelers();
  };

  const clearFilters = () => {
    setSelectedDestId('');
    setSelectedStyle('all');
    setCitySearch('');
    setFromDate('');
    setToDate('');
  };

  const travelStyles = [
    'all',
    'Cultural Explorer',
    'Explorer',
    'Adventure',
    'Budget',
    'Relaxation',
    'Photography',
    'Backpacker',
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Travel Connect Subnav */}
      <TravelConnectNav onOpenSettings={() => setShowSettings(true)} />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-900 via-orange-950 to-stone-900 text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            Find People Going to the Same Destination
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Travel Together. <span className="text-amber-400">Never Journey Alone.</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Connect with verified travelers heading your way. Match on dates, cultural interests,
            and travel styles with explainable compatibility scores.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* Filter Bar Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 sm:p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Destination Dropdown */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Destination
                </label>
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium border border-gray-300 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">All Destinations</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.destinationName} ({d.stateName})
                    </option>
                  ))}
                </select>
              </div>

              {/* City or Keyword Search */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-amber-600" />
                  City / Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="e.g. Varanasi, Jaipur, Hampi..."
                    className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2.5 pr-8 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {citySearch && (
                    <button
                      type="button"
                      onClick={() => setCitySearch('')}
                      className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* From Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Earliest Travel Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Latest Travel Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Travel Style Pills & Clear Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-gray-400" />
                  Style:
                </span>
                {travelStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selectedStyle === style
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {style === 'all' ? 'All Styles' : style}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {(selectedDestId || selectedStyle !== 'all' || citySearch || fromDate || toDate) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-medium text-gray-500 hover:text-red-600 transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Apply Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>Matching Travelers</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {totalCount} Available
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Compatibility scores are calculated deterministically from shared destinations, dates,
              interests, and languages.
            </p>
          </div>

          <button
            onClick={fetchTravelers}
            className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition"
            title="Refresh results"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>

        {/* Travelers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-16 bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={fetchTravelers}
              className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : travelers.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">No travelers found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                We couldn&apos;t find any travelers matching your exact search criteria. Try removing
                the date filter, choosing another destination, or clearing all filters.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {travelers.map((traveler) => (
              <TravelBuddyCard key={traveler.id} traveler={traveler} />
            ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default function TravelConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-xs font-semibold text-gray-400">Loading Travel Connect...</div>
        </div>
      }
    >
      <TravelConnectContent />
    </Suspense>
  );
}
