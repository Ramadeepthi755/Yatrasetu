'use client';

import React, { useEffect, useState } from 'react';
import { Utensils, AlertCircle, RefreshCw, Leaf } from 'lucide-react';
import { getDestinationFood, FamousFoodItem } from '@/lib/api';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EcosystemEmptyState } from './EcosystemEmptyState';

export interface FamousFoodSectionProps {
  destinationId: string;
  destinationName: string;
}

export function FamousFoodSection({ destinationId, destinationName }: FamousFoodSectionProps) {
  const [foods, setFoods] = useState<FamousFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFood = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDestinationFood(destinationId);
      if (res.success && res.data) {
        setFoods(res.data);
      } else {
        setFoods([]);
      }
    } catch (err) {
      console.error('Failed to load famous food:', err);
      setError('Unable to load regional cuisine data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchFood();
    }
  }, [destinationId]);

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <Utensils className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Famous Regional Food & Dishes
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Iconic regional dishes and must-try local specialties from curated cultural datasets
          </p>
        </div>
        <ProvenanceBadge sourceType="DATASET" sourceLabel="Dataset" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/60 dark:border-slate-800"
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
            onClick={fetchFood}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : foods.length === 0 ? (
        <EcosystemEmptyState
          title="No Regional Dishes Cataloged Yet"
          category="Local Food"
          destinationName={destinationName}
          description={`Curated dish entries for ${destinationName} are being compiled from regional cultural datasets.`}
          showPartnerCta={false}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {foods.map((food) => (
            <div
              key={food.id}
              className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition-all hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors text-sm">
                    {food.dishName}
                  </h4>
                  {food.isVegetarian !== null && (
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                        food.isVegetarian
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'border-red-500/30 text-red-600 bg-red-50 dark:bg-red-950/40'
                      }`}
                      title={food.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      <Leaf className="w-2.5 h-2.5" />
                      <span>{food.isVegetarian ? 'Veg' : 'Non-Veg'}</span>
                    </span>
                  )}
                </div>
                {food.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {food.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-orange-500" />
                  <span>Curated Specialty</span>
                </span>
                <ProvenanceBadge
                  sourceType={food.sourceType}
                  sourceLabel={food.sourceLabel}
                  className="scale-90 origin-right"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
