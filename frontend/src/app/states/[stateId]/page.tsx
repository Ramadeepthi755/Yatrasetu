'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Building2,
  Compass,
  ArrowLeft,
  Camera,
  Bed,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getStateDetail, StateDetail } from '@/lib/api';
import { DestinationCard } from '@/components/explore/DestinationCard';
import { CityCard } from '@/components/explore/CityCard';
import { PoiCard } from '@/components/explore/PoiCard';
import { HotelCard } from '@/components/explore/HotelCard';
import { MapView, MapMarker } from '@/components/map/MapView';

export default function StateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stateId = params.stateId as string;

  const [state, setState] = useState<StateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadState() {
      if (!stateId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getStateDetail(stateId);
        if (res.success && res.data) {
          setState(res.data);
        } else {
          setError('State not found.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Unable to load state details. Please verify the link or try again.');
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, [stateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-500">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold uppercase tracking-wider">Loading State Exploration Hub...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">State Not Found</h2>
        <p className="mt-2 text-sm text-stone-500 max-w-md">
          {error || `We could not locate state record for "${stateId}".`}
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore India</span>
        </Link>
      </div>
    );
  }

  // Build map markers for this state
  const mapMarkers: MapMarker[] = [];

  // Add Destinations
  state.featuredDestinations?.forEach((d) => {
    if (d.latitude && d.longitude) {
      mapMarkers.push({
        id: `dest-${d.id}`,
        title: d.destinationName,
        subtitle: `Rating: ★${d.popularityScore}`,
        latitude: d.latitude,
        longitude: d.longitude,
        type: 'destination',
        category: d.tripTypes?.[0],
        linkUrl: `/destinations/${d.id}`,
      });
    }
  });

  // Add Cities
  state.popularCities?.forEach((c) => {
    if (c.latitude && c.longitude) {
      mapMarkers.push({
        id: `city-${c.id}`,
        title: c.cityName,
        subtitle: `Tier: ${c.tier || 'Urban Hub'}`,
        latitude: c.latitude,
        longitude: c.longitude,
        type: 'city',
        linkUrl: `/cities/${c.id}`,
      });
    }
  });

  // Add POIs
  state.topPois?.forEach((p) => {
    if (p.latitude && p.longitude) {
      mapMarkers.push({
        id: `poi-${p.id}`,
        title: p.poiName,
        subtitle: p.category,
        latitude: p.latitude,
        longitude: p.longitude,
        type: 'poi',
        category: p.category,
      });
    }
  });

  // Add Hotels
  state.hotels?.forEach((h) => {
    if (h.latitude && h.longitude) {
      mapMarkers.push({
        id: `hotel-${h.id}`,
        title: h.hotelName,
        subtitle: `₹${Number(h.pricePerNight).toLocaleString('en-IN')}/night`,
        latitude: h.latitude,
        longitude: h.longitude,
        type: 'hotel',
        category: h.category,
      });
    }
  });

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20">
      {/* 1. State Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-stone-900 text-white">
        {state.bannerImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img
              src={state.bannerImageUrl}
              alt={state.stateName}
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        )}

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link
            href="/explore"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-stone-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Explore India</span>
          </Link>

          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md border border-amber-500/30 mb-4">
            <Compass className="h-3.5 w-3.5" />
            <span>{state.region}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            {state.stateName}
          </h1>

          {state.capitalCity && (
            <p className="mt-2 text-sm text-stone-300 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-amber-400" />
              State Capital: <span className="font-semibold text-white ml-1">{state.capitalCity}</span>
            </p>
          )}

          {state.description && (
            <p className="mt-4 max-w-3xl text-sm md:text-base text-stone-300 leading-relaxed">
              {state.description}
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md border border-white/10">
              <span className="text-2xl font-black text-amber-400">{state.destinationCount}</span>
              <span className="block text-xs font-medium text-stone-300">Curated Destinations</span>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md border border-white/10">
              <span className="text-2xl font-black text-teal-400">{state.cityCount}</span>
              <span className="block text-xs font-medium text-stone-300">Hub Cities</span>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md border border-white/10">
              <span className="text-2xl font-black text-white">{state.topPois?.length || 0}</span>
              <span className="block text-xs font-medium text-stone-300">Key Attractions</span>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md border border-white/10">
              <span className="text-2xl font-black text-white">{state.hotels?.length || 0}</span>
              <span className="block text-xs font-medium text-stone-300">Hotels & Resorts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section 1: Featured Destinations in State */}
        {state.featuredDestinations && state.featuredDestinations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  Featured Destinations in {state.stateName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Top tourist circuits and holiday destinations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {state.featuredDestinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Interactive State Map */}
        {mapMarkers.length > 0 && (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
            <MapView
              markers={mapMarkers}
              title={`Interactive Tourism Map of ${state.stateName}`}
              subtitle="Explore spatial locations of destinations, cities, sights, and accommodations."
            />
          </section>
        )}

        {/* Section 3: Popular Cities & Hubs */}
        {state.popularCities && state.popularCities.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  Key Cities & Travel Hubs
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Urban entry points, heritage centers and districts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {state.popularCities.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Attractions & POIs */}
        {state.topPois && state.topPois.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-teal-600" />
                  Points of Interest & Attractions
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified heritage spots, viewpoints, and cultural locations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.topPois.slice(0, 12).map((poi) => (
                <PoiCard key={poi.id} poi={poi} />
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Accommodations in State */}
        {state.hotels && state.hotels.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-indigo-900" />
                  Places to Stay in {state.stateName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Hotels, heritage properties, and certified partner homestays
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.hotels.slice(0, 9).map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
