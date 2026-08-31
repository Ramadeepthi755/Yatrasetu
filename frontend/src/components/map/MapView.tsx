'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Loader2 } from 'lucide-react';
import { MapMarker } from './LeafletMapInner';

export type { MapMarker };

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full flex-col items-center justify-center rounded-2xl bg-stone-100 border border-stone-200 text-stone-500 animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
      <span className="text-xs font-semibold uppercase tracking-wider">Loading Interactive Map...</span>
    </div>
  ),
});

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function MapView({
  markers,
  center,
  zoom,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-stone-200',
  title,
  subtitle,
}: MapViewProps) {
  return (
    <div className="w-full space-y-3">
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h4 className="text-lg font-bold text-stone-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-amber-500" />
                {title}
              </h4>
            )}
            {subtitle && <p className="text-xs text-stone-500">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-3 text-xs text-stone-600 font-medium">
            <span className="flex items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-1.5" /> Destination
            </span>
            <span className="flex items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-600 mr-1.5" /> POI
            </span>
            <span className="flex items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-900 mr-1.5" /> Hotel
            </span>
          </div>
        </div>
      )}

      <LeafletMapInner markers={markers} center={center} zoom={zoom} className={className} />
    </div>
  );
}
