'use client';

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { DestinationDetail, PoiItem } from '@/lib/api';
import { MapView, MapMarker } from '@/components/map/MapView';

interface DestinationMapProps {
  destination: DestinationDetail;
  pois?: PoiItem[];
}

export function DestinationMap({ destination, pois = [] }: DestinationMapProps) {
  const lat = destination.latitude || 20.5937;
  const lng = destination.longitude || 78.9629;

  // Build markers: destination + top POIs
  const markers: MapMarker[] = [
    {
      id: destination.id,
      title: destination.destinationName,
      subtitle: `${destination.stateName || 'India'} (Altitude: ${destination.altitudeM || 0}m)`,
      latitude: lat,
      longitude: lng,
      type: 'destination',
    },
  ];

  pois.slice(0, 5).forEach((poi) => {
    if (poi.latitude && poi.longitude && (poi.latitude !== 0 || poi.longitude !== 0)) {
      markers.push({
        id: poi.id,
        title: poi.poiName,
        subtitle: poi.category || 'Attraction',
        latitude: poi.latitude,
        longitude: poi.longitude,
        type: 'poi',
      });
    }
  });

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${destination.destinationName} ${destination.stateName || 'India'}`
  )}`;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base md:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <MapPin className="h-4.5 w-4.5 text-rose-500" />
          <span>Location & Map</span>
        </h2>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-900 dark:text-indigo-400 hover:underline"
        >
          <span>Open in Maps</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Map Container */}
      <div className="flex-1 min-h-[170px] w-full rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-inner">
        <MapView
          markers={markers}
          center={[lat, lng]}
          zoom={12}
          className="h-full min-h-[170px] w-full"
        />
      </div>
    </div>
  );
}
