'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Compass, ShieldCheck, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { getLocalHosts, LocalHost } from '@/lib/api';
import { LocalHostCard } from '@/components/explore/LocalHostCard';

export default function LocalHostsDirectoryPage() {
  const [hosts, setHosts] = useState<LocalHost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [skill, setSkill] = useState<string>('all');
  const [isVerifiedOnly, setIsVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('rating');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const loadHosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load local hosts';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, skill, isVerifiedOnly, sortBy, currentPage]);

  useEffect(() => {
    loadHosts();
  }, [loadHosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadHosts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSkill('all');
    setIsVerifiedOnly(false);
    setSortBy('rating');
    setCurrentPage(0);
  };

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
              YatraSetu Local
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Meet India Through Its People
            </h1>
            <p className="mt-4 text-base text-stone-300 sm:text-lg leading-relaxed">
              Connect with verified community guides, master artisans, and storytellers who bring heritage, culture, and traditions to life beyond conventional tourist itineraries.
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
                placeholder="Search by host name, city, skills, or heritage keywords..."
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
        {/* Sample Data Disclosure Banner */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-sm backdrop-blur-md flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Honest Directory Disclosure:</span> Profiles tagged with{' '}
            <span className="font-semibold text-stone-700 underline">Sample Guide</span> are curated realistic demonstration profiles representing registered tourism community hosts across India. Verified partner profiles show a green badge.
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 flex items-center mr-1">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter:
            </span>

            {/* Skill / Role Dropdown */}
            <select
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value);
                setCurrentPage(0);
              }}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 focus:border-amber-400 focus:outline-none"
            >
              {skillOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Verified Only Toggle */}
            <button
              onClick={() => {
                setIsVerifiedOnly(!isVerifiedOnly);
                setCurrentPage(0);
              }}
              className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                isVerifiedOnly
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-teal-600" />
              Verified Only
            </button>

            {(search || skill !== 'all' || isVerifiedOnly || sortBy !== 'rating') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center text-xs text-amber-700 hover:text-amber-800 ml-2 font-medium"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Reset
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-stone-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-700 focus:border-amber-400 focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="experienceCount">Most Experiences</option>
              <option value="pricePerHour">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4 flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Showing <strong className="text-stone-900">{hosts.length}</strong> of{' '}
            <strong className="text-stone-900">{totalElements}</strong> local hosts
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
              onClick={loadHosts}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && hosts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <Compass className="mx-auto h-12 w-12 text-stone-400 mb-3" />
            <h3 className="text-base font-bold text-stone-900">No local hosts matched your search</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search terms, removing filters, or resetting to see all available local people.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-400"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Host Cards Grid */}
        {!loading && !error && hosts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hosts.map((host) => (
              <LocalHostCard key={host.id} host={host} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
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
