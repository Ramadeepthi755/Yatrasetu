'use client';

import React, { useState } from 'react';
import { MapPin, ArrowRight, X, Compass, ExternalLink } from 'lucide-react';
import { PoiItem, DestinationDetail } from '@/lib/api';

interface MustVisitPlacesProps {
  destination: DestinationDetail;
  pois?: PoiItem[];
}

interface PlaceCardData {
  id: string;
  name: string;
  description: string;
  category?: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}

export function MustVisitPlaces({ destination, pois = [] }: MustVisitPlacesProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceCardData | null>(null);

  // Helper for dependable high-quality fallback travel images
  const getPlaceImage = (name: string, index: number, category?: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cave') || lower.includes('borra'))
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('waterfall') || lower.includes('falls') || lower.includes('katiki'))
      return 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('coffee') || lower.includes('estate') || lower.includes('plantation'))
      return 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('museum') || lower.includes('tribal') || lower.includes('art'))
      return 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('temple') || lower.includes('mandir') || lower.includes('ghat'))
      return 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('fort') || lower.includes('palace') || lower.includes('ruin') || lower.includes('monument'))
      return 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80';
    if (lower.includes('lake') || lower.includes('beach') || lower.includes('river'))
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

    const stockImages = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    ];
    return stockImages[index % stockImages.length];
  };

  // Compile place items from POIs or primary attractions
  const placeItems: PlaceCardData[] = [];

  if (pois && pois.length > 0) {
    pois.forEach((poi, idx) => {
      placeItems.push({
        id: poi.id,
        name: poi.poiName,
        description: poi.characteristics || (poi.tags && poi.tags.length > 0 ? poi.tags.join(', ') : 'Popular local point of interest'),
        category: poi.category,
        imageUrl: getPlaceImage(poi.poiName, idx, poi.category),
        latitude: poi.latitude,
        longitude: poi.longitude,
      });
    });
  } else if (destination.primaryAttractions && destination.primaryAttractions.length > 0) {
    destination.primaryAttractions.forEach((attr, idx) => {
      placeItems.push({
        id: `attr-${destination.id}-${idx}`,
        name: attr,
        description: `Key attraction and landmark in ${destination.destinationName}`,
        imageUrl: getPlaceImage(attr, idx),
      });
    });
  }

  // Display top 4
  const displayPlaces = placeItems.slice(0, 4);
  const hasMore = placeItems.length > 4;

  if (displayPlaces.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <span>Must-Visit Places</span>
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Point of interest data is being curated for {destination.destinationName}.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <span>Must-Visit Places</span>
          </h2>

          {hasMore && (
            <button
              onClick={() => setShowAllModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 dark:text-indigo-400 hover:text-indigo-950 dark:hover:text-indigo-300 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-1">
          {displayPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => setSelectedPlace(place)}
              className="group cursor-pointer flex flex-col rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 p-2 md:p-2.5 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/50 transition-all duration-200"
            >
              {/* Card Image */}
              <div className="relative h-28 sm:h-32 w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-700 mb-2.5">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Title & Description */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {place.description}
                  </p>
                </div>

                {/* Arrow Action */}
                <div className="flex items-center justify-end mt-2">
                  <div className="h-6 w-6 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center text-stone-600 dark:text-stone-300 group-hover:bg-amber-500 group-hover:text-stone-950 group-hover:border-amber-500 transition-colors">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Place Details Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-48 w-full overflow-hidden rounded-2xl bg-stone-100">
              <img
                src={selectedPlace.imageUrl}
                alt={selectedPlace.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                  {selectedPlace.category || 'Attraction'}
                </span>
                <span className="text-xs text-stone-400">• {destination.destinationName}</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                {selectedPlace.name}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                {selectedPlace.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Close
              </button>
              {destination.latitude && destination.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selectedPlace.name + ' ' + destination.destinationName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View All Places Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                <span>All Attractions in {destination.destinationName} ({placeItems.length})</span>
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {placeItems.map((place) => (
                <div
                  key={place.id}
                  onClick={() => {
                    setShowAllModal(false);
                    setSelectedPlace(place);
                  }}
                  className="cursor-pointer rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 p-3 hover:border-amber-300 transition-colors"
                >
                  <div className="h-32 w-full overflow-hidden rounded-xl bg-stone-200 mb-2">
                    <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{place.name}</h4>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{place.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
