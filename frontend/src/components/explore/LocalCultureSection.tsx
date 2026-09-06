'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Palette,
  Search,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
  Landmark,
  X,
} from 'lucide-react';
import {
  getCulturalTraditions,
  getCulturalCategories,
  CulturalTraditionDto,
  StateSummary,
} from '@/lib/api';
import { CulturalTraditionCard } from './CulturalTraditionCard';

export interface LocalCultureSectionProps {
  statesList?: StateSummary[];
  className?: string;
}

export function LocalCultureSection({ statesList = [], className = '' }: LocalCultureSectionProps) {
  const [traditions, setTraditions] = useState<CulturalTraditionDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [giOnly, setGiOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(0); // Reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load categories metadata
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCulturalCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load cultural categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch paginated cultural traditions
  const fetchTraditions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCulturalTraditions({
        stateId: selectedState !== 'ALL' ? selectedState : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: debouncedSearch !== '' ? debouncedSearch : undefined,
        page,
        size: pageSize,
      });

      if (res.success && res.data) {
        let items: CulturalTraditionDto[] = res.data.content || [];
        // Apply GI client-side filter if enabled
        if (giOnly) {
          items = items.filter((t: CulturalTraditionDto) => t.isGiTagged === true);
        }
        setTraditions(items);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setError('Failed to load cultural traditions.');
      }
    } catch (err: any) {
      console.error('Error fetching cultural traditions:', err);
      setError('Unable to load cultural traditions at this moment.');
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedCategory, debouncedSearch, page, pageSize, giOnly]);

  useEffect(() => {
    fetchTraditions();
  }, [fetchTraditions]);

  const resetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedState('ALL');
    setGiOnly(false);
    setSearchQuery('');
    setPage(0);
  };

  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    selectedState !== 'ALL' ||
    giOnly ||
    searchQuery.trim() !== '';

  return (
    <section
      id="local-culture-section"
      className={`rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-gradient-to-b from-amber-50/30 via-white to-stone-50/40 dark:from-stone-900/60 dark:via-stone-900 dark:to-stone-950 p-6 md:p-10 shadow-sm ${className}`}
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/50 mb-3">
            <Palette className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
            <span>Living Heritage & Traditional Crafts</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Local Culture & Heritage Arts
          </h2>
          <p className="mt-2 text-sm md:text-base text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
            Discover the traditions, crafts and cultural practices rooted in each region of India.
          </p>
        </div>

        {/* Global GI Tag Metric Indicator */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setGiOnly(!giOnly);
              setPage(0);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              giOnly
                ? 'bg-amber-500 text-stone-950 border-amber-400 ring-2 ring-amber-400/40'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
            }`}
            title="Filter by Geographical Indication (GI) tagged crafts"
          >
            <Award className={`h-4 w-4 ${giOnly ? 'text-stone-950' : 'text-amber-600'}`} />
            <span>GI Certified Only</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="space-y-4 mb-8">
        {/* Row 1: Search and State selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search craft, painting, handloom, metal..."
              className="w-full pl-9.5 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* State selector */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by State or Union Territory"
              className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            >
              <option value="ALL">All States &amp; Union Territories (36)</option>
              {statesList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.stateName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown for Mobile / Compact */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by Cultural Category"
              className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            >
              <option value="ALL">All Cultural Categories ({categories.length || '13'})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Category Quick-Pill Badges */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none pt-1">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setPage(0);
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(active ? 'ALL' : cat);
                    setPage(0);
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-800 text-white shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filter Summary and Clear Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
            <span>
              Showing {traditions.length} of {totalElements} cultural traditions
            </span>
            <button
              onClick={resetFilters}
              className="font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 underline inline-flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty/Loading States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(pageSize)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/40 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-8 text-center border border-rose-200 dark:border-rose-900/60">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{error}</p>
          <button
            onClick={() => fetchTraditions()}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : traditions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
            <Landmark className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            No matching cultural traditions found
          </h3>
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any source-backed traditions matching your current search or filters. Try adjusting your state or category selection.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {traditions.map((tradition) => (
            <CulturalTraditionCard key={tradition.id} tradition={tradition} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <div className="mt-8 flex items-center justify-between border-t border-stone-200/80 dark:border-stone-800 pt-5">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Page <span className="font-semibold text-stone-800 dark:text-stone-200">{page + 1}</span> of{' '}
            <span className="font-semibold text-stone-800 dark:text-stone-200">{totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
