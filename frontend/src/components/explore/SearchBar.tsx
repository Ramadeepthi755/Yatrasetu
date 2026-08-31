'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, MapPin, Building2, Landmark, Camera, Bed } from 'lucide-react';
import { searchDiscovery, SearchResults } from '@/lib/api';

interface SearchBarProps {
  initialQuery?: string;
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  initialQuery = '',
  onSearchSubmit,
  placeholder = 'Search destinations, cities, experiences, hotels...',
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search on backend API
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchDiscovery(query.trim(), 'all', 5);
        if (res.success && res.data) {
          setResults(res.data);
          setIsOpen(true);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query.trim());
    } else if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute left-4 flex items-center text-stone-400">
          <Search className="h-5 w-5 text-amber-500" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results && results.totalResults > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-stone-300/80 bg-white py-3.5 pl-12 pr-28 text-sm text-stone-900 shadow-lg shadow-stone-900/5 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />

        <div className="absolute right-2 flex items-center space-x-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults(null);
              }}
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className="rounded-xl bg-indigo-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-800 transition-colors flex items-center space-x-1"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>Search</span>}
          </button>
        </div>
      </form>

      {/* Auto-suggest Dropdown */}
      {isOpen && results && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
          {results.totalResults === 0 ? (
            <div className="p-4 text-center text-sm text-stone-500">
              No results found for &ldquo;<span className="font-semibold">{query}</span>&rdquo;
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {/* Destinations */}
              {results.destinations && results.destinations.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Destinations
                  </div>
                  {results.destinations.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleSelect(`/destinations/${d.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-amber-50/60 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-stone-900">{d.destinationName}</span>
                          <span className="text-xs text-stone-500 ml-1.5">{d.stateName}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-600">★ {d.popularityScore}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Cities */}
              {results.cities && results.cities.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    Cities
                  </div>
                  {results.cities.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(`/cities/${c.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-indigo-50/60 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Building2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-stone-900">{c.cityName}</span>
                          <span className="text-xs text-stone-500 ml-1.5">{c.stateName}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-stone-400">{c.tier}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* States */}
              {results.states && results.states.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    States & Territories
                  </div>
                  {results.states.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect(`/states/${s.id}`)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-teal-50/60 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Landmark className="h-4 w-4 text-teal-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-stone-900">{s.stateName}</span>
                          <span className="text-xs text-stone-500 ml-1.5">{s.region}</span>
                        </div>
                      </div>
                      <span className="text-xs text-teal-700 font-medium">{s.destinationCount} dests</span>
                    </button>
                  ))}
                </div>
              )}

              {/* POIs */}
              {results.pois && results.pois.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                    Points of Interest
                  </div>
                  {results.pois.map((p) => (
                    <div
                      key={p.id}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Camera className="h-4 w-4 text-rose-500 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-stone-900">{p.poiName}</span>
                          <span className="text-xs text-stone-400 ml-1.5">{p.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hotels */}
              {results.hotels && results.hotels.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
                    Accommodations
                  </div>
                  {results.hotels.map((h) => (
                    <div
                      key={h.id}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Bed className="h-4 w-4 text-violet-600 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-stone-900">{h.hotelName}</span>
                          <span className="text-xs text-stone-400 ml-1.5">₹{Number(h.pricePerNight).toLocaleString('en-IN')}/night</span>
                        </div>
                      </div>
                      <span className="text-xs text-amber-600 font-bold">★ {Number(h.hotelRating).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
