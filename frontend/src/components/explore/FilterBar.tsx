'use client';

import React from 'react';
import { Filter, SlidersHorizontal, Compass, Sparkles } from 'lucide-react';
import { StateSummary } from '@/lib/api';

interface FilterBarProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  statesList: StateSummary[];
  totalResults?: number;
}

const REGIONS = [
  'All',
  'North India',
  'South India',
  'West India',
  'East India',
  'North East India',
  'Central India',
];

const CATEGORIES = [
  'All',
  'Heritage',
  'Nature',
  'Beach',
  'Adventure',
  'Spiritual',
  'Culture',
  'Hill Station',
  'Food',
];

export function FilterBar({
  selectedRegion,
  onRegionChange,
  selectedState,
  onStateChange,
  selectedCategory,
  onCategoryChange,
  statesList,
  totalResults,
}: FilterBarProps) {
  // Filter available states based on selected region
  const filteredStates =
    selectedRegion && selectedRegion !== 'All'
      ? statesList.filter((s) => s.region.toLowerCase() === selectedRegion.toLowerCase())
      : statesList;

  return (
    <div className="w-full space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {/* Category Pills Bar */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Travel Themes</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(isSelected ? 'All' : cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-stone-100 pt-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Region & State Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Compass className="h-4 w-4 text-indigo-900" />
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="All">All Regions</option>
              {REGIONS.filter((r) => r !== 'All').map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="All">All States / UTs</option>
              {filteredStates.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stateName}
                </option>
              ))}
            </select>
          </div>

          {(selectedRegion !== 'All' || selectedState !== 'All' || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                onRegionChange('All');
                onStateChange('All');
                onCategoryChange('All');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {totalResults !== undefined && (
          <div className="text-xs font-medium text-stone-500">
            Showing <span className="font-bold text-stone-900">{totalResults}</span> places across India
          </div>
        )}
      </div>
    </div>
  );
}
