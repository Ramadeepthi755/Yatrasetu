'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, MapPin } from 'lucide-react';
import { CitySummary } from '@/lib/api';

interface CityCardProps {
  city: CitySummary;
}

export function CityCard({ city }: CityCardProps) {
  return (
    <Link
      href={`/cities/${city.id}`}
      className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-amber-400"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 group-hover:text-indigo-950 transition-colors">
                {city.cityName}
              </h4>
              <p className="text-xs text-stone-500 flex items-center">
                <MapPin className="h-3 w-3 mr-0.5 text-stone-400" />
                {city.stateName || 'India'} {city.districtName ? `(${city.districtName})` : ''}
              </p>
            </div>
          </div>
          {city.tier && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200">
              {city.tier}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs text-stone-500">
        <div className="flex space-x-2">
          <span>{city.destinationCount} dests</span>
          <span>•</span>
          <span>{city.poiCount} POIs</span>
          <span>•</span>
          <span>{city.hotelCount} hotels</span>
        </div>
        <span className="font-medium text-indigo-900 group-hover:translate-x-0.5 transition-transform">
          &rarr;
        </span>
      </div>
    </Link>
  );
}
