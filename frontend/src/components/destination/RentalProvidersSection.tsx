'use client';

import React, { useEffect, useState } from 'react';
import { Bike, AlertCircle, RefreshCw, MapPin, Phone, Globe, CheckCircle2 } from 'lucide-react';
import { getDestinationRentals, RentalProviderItem } from '@/lib/api';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EcosystemEmptyState } from './EcosystemEmptyState';

export interface RentalProvidersSectionProps {
  destinationId: string;
  destinationName: string;
}

export function RentalProvidersSection({ destinationId, destinationName }: RentalProvidersSectionProps) {
  const [rentals, setRentals] = useState<RentalProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDestinationRentals(destinationId);
      if (res.success && res.data) {
        setRentals(res.data);
      } else {
        setRentals([]);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
      setError('Unable to load vehicle rental providers right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchRentals();
    }
  }, [destinationId]);

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Bike className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Bike & Car Rentals
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified local rental partners for two-wheelers and self-drive vehicles
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {rentals.length} {rentals.length === 1 ? 'provider' : 'providers'} available
        </span>
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
            onClick={fetchRentals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : rentals.length === 0 ? (
        <EcosystemEmptyState
          title="No Verified Rental Providers Registered Yet"
          category="Vehicle Rental"
          destinationName={destinationName}
          description={`We do not fabricate fake rental shops, bike models, or tariffs. Authorized rental providers for ${destinationName} will appear as they register and get verified.`}
          showPartnerCta={true}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rentals.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {r.providerName}
                  </h4>
                  {r.isVerified && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {r.vehicleTypes && (
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-2">
                    {r.vehicleTypes}
                  </p>
                )}

                {r.address && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{r.address}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <ProvenanceBadge
                  sourceType={r.sourceType}
                  sourceLabel={r.sourceLabel}
                  isVerified={r.isVerified}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
