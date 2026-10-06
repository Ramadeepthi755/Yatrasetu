'use client';

import React, { useState } from 'react';
import { MapPin, ArrowRight, X, ExternalLink, Landmark, Mountain, Waves, Trees } from 'lucide-react';
import { PoiItem, DestinationDetail } from '@/lib/api';
import { resolveEntityImage } from '@/lib/imageResolver';

interface MustVisitPlacesProps {
  destination: DestinationDetail;
  pois?: PoiItem[];
}

interface PlaceCardData {
  id: string;
  name: string;
  description: string;
  category?: string;
  imageUrl?: string | null;
  latitude?: number;
  longitude?: number;
}

export function MustVisitPlaces({ destination, pois = [] }: MustVisitPlacesProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceCardData | null>(null);

  // Compile place items from POIs or primary attractions
  const placeItems: PlaceCardData[] = [];

  if (pois && pois.length > 0) {
    pois.forEach((poi) => {
      placeItems.push({
        id: poi.id,
        name: poi.poiName,
        description: poi.characteristics || (poi.tags && poi.tags.length > 0 ? poi.tags.join(', ') : 'Popular local point of interest'),
        category: poi.category || 'Attraction',
        imageUrl: resolveEntityImage({
          destinationName: destination.destinationName,
          entityName: poi.poiName,
          category: poi.category,
          entityType: 'poi',
          providedImageUrl: (poi as any).imageUrl,
        }),
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
        category: 'Highlight',
        imageUrl: resolveEntityImage({
          destinationName: destination.destinationName,
          entityName: attr,
          entityType: 'poi',
        }),
      });
    });
  }

  // Display top 4
  const displayPlaces = placeItems.slice(0, 4);
  const hasMore = placeItems.length > 4;

  const renderCardVisual = (place: PlaceCardData, isModal: boolean = false) => {
    const heightClass = isModal ? 'h-48' : 'h-28 sm:h-32';
    if (place.imageUrl) {
      return (
        <div className={`relative ${heightClass} w-full overflow-hidden rounded-xl bg-stone-200 mb-2.5`}>
          <img
            src={place.imageUrl}
            alt={place.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      );
    }

    // Neutral placeholder with thematic icon and gradient
    const cat = (place.category || '').toLowerCase();
    let Icon = Landmark;
    let gradient = 'from-amber-500/20 via-orange-500/10 to-stone-100';

    if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('garden')) {
      Icon = Trees;
      gradient = 'from-emerald-500/20 via-teal-500/10 to-stone-100';
    } else if (cat.includes('beach') || cat.includes('water') || cat.includes('lake')) {
      Icon = Waves;
      gradient = 'from-sky-500/20 via-blue-500/10 to-stone-100';
    } else if (cat.includes('trek') || cat.includes('hill') || cat.includes('viewpoint')) {
      Icon = Mountain;
      gradient = 'from-indigo-500/20 via-purple-500/10 to-stone-100';
    }

    return (
      <div className={`relative ${heightClass} w-full overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-stone-200/60 flex flex-col items-center justify-center p-3 mb-2.5 text-center`}>
        <div className="h-10 w-10 rounded-xl bg-white/90 shadow-xs flex items-center justify-center text-amber-600 mb-1.5">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
          {place.category || 'POI'}
        </span>
      </div>
    );
  };

  if (displayPlaces.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <span>Must-Visit Places</span>
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Point of interest data is being curated for {destination.destinationName}.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <span>Must-Visit Places</span>
          </h2>

          {hasMore && (
            <button
              onClick={() => setShowAllModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors cursor-pointer"
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
              className="group cursor-pointer flex flex-col rounded-2xl border border-stone-200/80 bg-stone-50/50 p-2 md:p-2.5 hover:shadow-md hover:border-amber-300 transition-all duration-200"
            >
              {/* Card Image / Visual */}
              {renderCardVisual(place)}

              {/* Title & Description */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {place.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {place.description}
                  </p>
                </div>

                {/* Arrow Action */}
                <div className="flex items-center justify-end mt-2">
                  <div className="h-6 w-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 group-hover:bg-amber-500 group-hover:text-stone-950 group-hover:border-amber-500 transition-colors">
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
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-stone-200 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {renderCardVisual(selectedPlace, true)}

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                  {selectedPlace.category || 'Attraction'}
                </span>
                <span className="text-xs text-stone-400">• {destination.destinationName}</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mt-1">
                {selectedPlace.name}
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {selectedPlace.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                onClick={() => setSelectedPlace(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
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
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white border border-stone-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                <span>All Attractions in {destination.destinationName} ({placeItems.length})</span>
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="h-8 w-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 flex items-center justify-center cursor-pointer"
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
                  className="cursor-pointer rounded-2xl border border-stone-200 bg-stone-50 p-3 hover:border-amber-300 transition-colors"
                >
                  {renderCardVisual(place)}
                  <h4 className="text-sm font-bold text-stone-900">{place.name}</h4>
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
