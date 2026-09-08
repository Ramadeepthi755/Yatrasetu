'use client';

import React from 'react';
import { Camera, Clock, IndianRupee, MapPin, Tag } from 'lucide-react';
import { PoiItem } from '@/lib/api';

interface PoiCardProps {
  poi: PoiItem;
}

export function PoiCard({ poi }: PoiCardProps) {
  const hasValidCoordinates =
    poi.latitude !== undefined &&
    poi.longitude !== undefined &&
    !(poi.latitude === 0 && poi.longitude === 0);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-teal-500/50">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2.5">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 leading-snug">{poi.poiName}</h4>
              <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-stone-500">
                <span className="rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-800 border border-teal-100">
                  {poi.category || 'Attraction'}
                </span>
                {poi.cityName && <span>• {poi.cityName}</span>}
              </div>
            </div>
          </div>
        </div>

        {poi.characteristics && (
          <p className="mt-2.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {poi.characteristics}
          </p>
        )}

        {poi.tags && poi.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {poi.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between border-t border-stone-100 pt-2 text-[11px] text-stone-500">
        <div className="flex items-center space-x-2.5">
          {poi.typicalDurationHours !== undefined && poi.typicalDurationHours > 0 && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-stone-400" />
              {poi.typicalDurationHours} hrs
            </span>
          )}
          {poi.entryFeeInr !== undefined && (
            <span className="flex items-center font-medium text-stone-700">
              <IndianRupee className="h-3 w-3 mr-0.5 text-stone-400" />
              {poi.entryFeeInr === 0 ? 'Free' : `₹${poi.entryFeeInr}`}
            </span>
          )}
        </div>

        {hasValidCoordinates && (
          <span className="flex items-center text-[10px] text-stone-400">
            <MapPin className="h-3 w-3 mr-0.5 text-teal-600" />
            {Number(poi.latitude).toFixed(3)}, {Number(poi.longitude).toFixed(3)}
          </span>
        )}
      </div>
    </div>
  );
}
