'use client';

import React, { useEffect, useState } from 'react';
import { Store, AlertCircle, RefreshCw, Star, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { getDestinationRestaurants, RestaurantItem } from '@/lib/api';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EcosystemEmptyState } from './EcosystemEmptyState';

export interface RestaurantsSectionProps {
  destinationId: string;
  destinationName: string;
}

export function RestaurantsSection({ destinationId, destinationName }: RestaurantsSectionProps) {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDestinationRestaurants(destinationId);
      if (res.success && res.data) {
        setRestaurants(res.data);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setError('Unable to load restaurant listings right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchRestaurants();
    }
  }, [destinationId]);

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Store className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Restaurants & Dining
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified local eateries and dining partners — zero fabricated listings
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'} available
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/60 dark:border-slate-800"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/50 dark:bg-red-950/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRestaurants}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : restaurants.length === 0 ? (
        <EcosystemEmptyState
          title="No Verified Restaurants Registered Yet"
          category="Restaurant"
          destinationName={destinationName}
          description={`We do not fabricate fake restaurant names, phone numbers, or menus. Verified dining partners for ${destinationName} will be published once verified.`}
          showPartnerCta={true}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {restaurants.map((rest) => (
            <div
              key={rest.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {rest.name}
                  </h4>
                  {rest.rating && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{rest.rating.toFixed(1)}</span>
                    </span>
                  )}
                </div>

                {rest.cuisineType && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                    {rest.cuisineType}
                  </p>
                )}

                {rest.address && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{rest.address}</span>
                  </p>
                )}

                {rest.openingHours && (
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{rest.openingHours}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{rest.priceRange || 'Standard'}</span>
                <ProvenanceBadge
                  sourceType={rest.sourceType}
                  sourceLabel={rest.sourceLabel}
                  isVerified={rest.isVerified}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
