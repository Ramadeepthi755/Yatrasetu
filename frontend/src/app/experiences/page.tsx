'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { getExperiences, getExperienceCategories, ExperienceItem } from '@/lib/api';
import { ExperienceCard } from '@/components/explore/ExperienceCard';

export default function ExperiencesCatalogPage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getExperienceCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch {
        // Fallback categories if server hasn't seeded distinct yet
        setCategories([
          'Heritage Tour',
          'Craft Workshop',
          'Food Walk',
          'Adventure',
          'Photography',
          'Spiritual Walk',
        ]);
      }
    }
    loadCategories();
  }, []);

  const loadExperiences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getExperiences({
        search: search.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy === 'priceAsc' ? 'pricePerPerson' : sortBy === 'priceDesc' ? 'pricePerPerson' : 'createdAt',
        direction: sortBy === 'priceAsc' ? 'asc' : 'desc',
        page: currentPage,
        size: 12,
      });

      if (res.success && res.data) {
        setExperiences(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load experiences';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadExperiences();
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('all');
    setSortBy('createdAt');
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-stone-900 py-16 text-white sm:py-20">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Authentic Indian Experiences
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Curated Cultural Walks & Hands-on Workshops
            </h1>
            <p className="mt-4 text-base text-stone-300 sm:text-lg leading-relaxed">
              Immerse yourself in centuries of living tradition. Row past Varanasi ghats at dawn, dye hand-block textiles with Jaipur masters, or canoe through secluded Kerala village backwaters.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search experiences by title, city, host, or activity..."
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Honest Demo Disclosure Banner */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-sm backdrop-blur-md flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Demonstration Catalog:</span> Experiences tagged with{' '}
            <span className="font-semibold text-stone-700 underline">Sample Experience</span> are curated benchmark journeys demonstrating realistic pricing, itineraries, and inclusions across India. Registered tourism partners can publish and manage their live listings.
          </div>
        </div>

        {/* Categories Bar & Filter Header */}
        <div className="mb-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(0);
              }}
              className={`rounded-full px-4 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Categories
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
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Second Row: Sort and Reset */}
          <div className="flex flex-wrap items-center justify-between border-t border-stone-100 pt-3 text-xs gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-stone-500 flex items-center">
                <Filter className="h-3.5 w-3.5 mr-1" /> Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-700 focus:border-amber-400 focus:outline-none"
              >
                <option value="createdAt">Newest Additions</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>

              {(search || selectedCategory !== 'all' || sortBy !== 'createdAt') && (
                <button
                  onClick={handleReset}
                  className="flex items-center text-xs text-amber-700 hover:text-amber-800 font-medium ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Reset
                </button>
              )}
            </div>

            <div className="text-stone-500">
              Showing <strong className="text-stone-900">{experiences.length}</strong> of{' '}
              <strong className="text-stone-900">{totalElements}</strong> experiences
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse flex flex-col justify-between"
              >
                <div className="h-48 bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-stone-200" />
                  <div className="h-3 w-1/2 rounded bg-stone-100" />
                </div>
                <div className="h-10 bg-stone-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-bold text-red-800 mb-2">{error}</p>
            <button
              onClick={loadExperiences}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && experiences.length === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-stone-400 mb-3" />
            <h3 className="text-base font-bold text-stone-900">No experiences match your search</h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              Try choosing a different category or clearing your search filters to explore available experiences.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 hover:bg-amber-400"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Experiences Grid */}
        {!loading && !error && experiences.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        )}

        {/* Pagination */}
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
