'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, AlertCircle, RefreshCw, MapPin, Phone, Globe, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getDestinationAgencies, TravelAgencyItem } from '@/lib/api';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EcosystemEmptyState } from './EcosystemEmptyState';

export interface TravelAgenciesSectionProps {
  destinationId: string;
  destinationName: string;
}

export function TravelAgenciesSection({ destinationId, destinationName }: TravelAgenciesSectionProps) {
  const [agencies, setAgencies] = useState<TravelAgencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDestinationAgencies(destinationId);
      if (res.success && res.data) {
        setAgencies(res.data);
      } else {
        setAgencies([]);
      }
    } catch (err) {
      console.error('Failed to load travel agencies:', err);
      setError('Unable to load travel agency listings right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchAgencies();
    }
  }, [destinationId]);

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Authorized Travel Agencies & Tour Operators
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Government-recognized travel agencies, licensed tour operators, and destination managers
          </p>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {agencies.length} {agencies.length === 1 ? 'agency' : 'agencies'} available
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
            onClick={fetchAgencies}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : agencies.length === 0 ? (
        <EcosystemEmptyState
          title="No Authorized Travel Agencies Registered Yet"
          category="Travel Agency"
          destinationName={destinationName}
          description={`We do not fabricate fake agency credentials or tour operators. Authorized travel agencies for ${destinationName} will appear once license verification is complete.`}
          showPartnerCta={true}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {agencies.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {a.agencyName}
                  </h4>
                  {a.isVerified && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Authorized</span>
                    </span>
                  )}
                </div>

                {a.licenseNumber && (
                  <p className="text-[11px] text-slate-400 font-mono mb-2">
                    Lic: {a.licenseNumber}
                  </p>
                )}

                {a.servicesOffered && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                    {a.servicesOffered}
                  </p>
                )}

                {a.address && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{a.address}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <ProvenanceBadge
                  sourceType={a.sourceType}
                  sourceLabel={a.sourceLabel}
                  isVerified={a.isVerified}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
