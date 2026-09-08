'use client';

import React, { useEffect, useState } from 'react';
import { Plane, Train, Bus, Car, AlertCircle, RefreshCw, Navigation, Info, ExternalLink } from 'lucide-react';
import { getDestinationTransport, DestinationTransportItem } from '@/lib/api';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EcosystemEmptyState } from './EcosystemEmptyState';

export interface TransportSectionProps {
  destinationId: string;
  destinationName: string;
}

export function TransportSection({ destinationId, destinationName }: TransportSectionProps) {
  const [transports, setTransports] = useState<DestinationTransportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDestinationTransport(destinationId);
      if (res.success && res.data) {
        setTransports(res.data);
      } else {
        setTransports([]);
      }
    } catch (err) {
      console.error('Failed to load transport:', err);
      setError('Unable to load connectivity and transport data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchTransport();
    }
  }, [destinationId]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'AIRPORT':
        return <Plane className="w-5 h-5 text-sky-500" />;
      case 'RAILWAY':
        return <Train className="w-5 h-5 text-emerald-500" />;
      case 'BUS_ROAD':
        return <Bus className="w-5 h-5 text-amber-500" />;
      default:
        return <Car className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getModeTitle = (mode: string) => {
    switch (mode) {
      case 'AIRPORT':
        return 'Nearest Airport';
      case 'RAILWAY':
        return 'Nearest Railway Station';
      case 'BUS_ROAD':
        return 'Highway & Road Connectivity';
      default:
        return 'Local Transport & Connectivity';
    }
  };

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Navigation className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Connectivity & How to Reach
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verified airports, rail hubs, and highway routes from government & tourism datasets
          </p>
        </div>
        <ProvenanceBadge sourceType="DATASET" sourceLabel="Dataset" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/60 dark:border-slate-800"
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
            onClick={fetchTransport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : transports.length === 0 ? (
        <EcosystemEmptyState
          title="Connectivity Information Limited"
          category="Transport"
          destinationName={destinationName}
          description={`Connectivity information is currently limited for this destination. Regional route logistics are updated as official state transport schedules become available.`}
          showPartnerCta={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transports.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getModeIcon(item.mode)}
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        {getModeTitle(item.mode)}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </h4>
                    </div>
                  </div>
                </div>

                {item.distanceKm !== null && item.distanceKm !== undefined && (
                  <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-medium border border-sky-100 dark:border-sky-900/60">
                    <span>Approx. {item.distanceKm} km from center</span>
                  </div>
                )}

                {item.description && item.description !== item.name && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-slate-400" title="Live fares fluctuate — check official portals">
                  <Info className="w-3 h-3" />
                  <span>
                    {item.priceType === 'PRICE_UNAVAILABLE'
                      ? 'Live fare on official portals'
                      : item.estimatedFareInr
                      ? `~₹${item.estimatedFareInr}`
                      : 'Fare on booking'}
                  </span>
                </span>
                <ProvenanceBadge
                  sourceType={item.sourceType}
                  sourceLabel={item.sourceLabel}
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
