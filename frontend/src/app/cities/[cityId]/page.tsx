'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Building2,
  ArrowLeft,
  Camera,
  Bed,
  Compass,
  Loader2,
  AlertCircle,
  Landmark,
} from 'lucide-react';
import { getCityDetail, CityDetail } from '@/lib/api';
import { DestinationCard } from '@/components/explore/DestinationCard';
import { PoiCard } from '@/components/explore/PoiCard';
import { HotelCard } from '@/components/explore/HotelCard';
import { MapView, MapMarker } from '@/components/map/MapView';

export default function CityDetailPage() {
  const params = useParams();
  const cityId = params.cityId as string;

  const [city, setCity] = useState<CityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCity() {
      if (!cityId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getCityDetail(cityId);
        if (res.success && res.data) {
          setCity(res.data);
        } else {
          setError('City not found.');
        }
      } catch (err: any) {
        console.error(err);
        setError('Unable to load city details. Please verify the link or try again.');
      } finally {
        setLoading(false);
      }
    }
    loadCity();
  }, [cityId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-500">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold uppercase tracking-wider">Loading City Travel Guide...</p>
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">City Not Found</h2>
        <p className="mt-2 text-sm text-stone-500 max-w-md">
          {error || `We could not locate records for "${cityId}".`}
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

  // Build map markers for this city
  const mapMarkers: MapMarker[] = [];

  // Add City centroid marker
  if (city.latitude && city.longitude) {
    mapMarkers.push({
      id: `city-${city.id}`,
      title: city.cityName,
      subtitle: `${city.districtName || ''}, ${city.stateName || ''}`,
      latitude: Number(city.latitude),
      longitude: Number(city.longitude),
      type: 'city',
    });
  }

  // Add Destinations
  city.destinations?.forEach((d) => {
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

  // Add POIs
  city.pois?.forEach((p) => {
    if (p.latitude && p.longitude) {
      mapMarkers.push({
        id: `poi-${p.id}`,
        title: p.poiName,
        subtitle: p.category,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude),
        type: 'poi',
        category: p.category,
      });
    }
  });

  // Add Hotels
  city.hotels?.forEach((h) => {
    if (h.latitude && h.longitude) {
      mapMarkers.push({
        id: `hotel-${h.id}`,
        title: h.hotelName,
        subtitle: `₹${Number(h.pricePerNight).toLocaleString('en-IN')}/night`,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
        type: 'hotel',
        category: h.category,
      });
    }
  });

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20">
      {/* 1. City Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-stone-900 py-12 md:py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Link
              href="/explore"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-stone-300 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Explore India</span>
            </Link>
            {city.stateId && (
              <>
                <span className="text-stone-500">/</span>
                <Link
                  href={`/states/${city.stateId}`}
                  className="text-xs font-semibold text-amber-300 hover:underline"
                >
                  {city.stateName}
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-md border border-indigo-500/30 mb-3">
                <Building2 className="h-3.5 w-3.5" />
                <span>{city.tier || 'Urban Tourism Hub'}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                {city.cityName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs md:text-sm text-stone-300">
                {city.districtName && (
                  <span className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-amber-400" />
                    District: {city.districtName}
                  </span>
                )}
                {city.stateName && (
                  <span className="flex items-center">
                    <Landmark className="h-3.5 w-3.5 mr-1 text-teal-400" />
                    State: {city.stateName}
                  </span>
                )}
                {city.latitude && city.longitude && (
                  <span className="text-stone-400">
                    Coords: {Number(city.latitude).toFixed(4)}° N, {Number(city.longitude).toFixed(4)}° E
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/10 text-center">
                <span className="text-xl font-bold text-amber-400">{city.destinations?.length || 0}</span>
                <span className="block text-[11px] text-stone-300">Destinations</span>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/10 text-center">
                <span className="text-xl font-bold text-teal-400">{city.pois?.length || 0}</span>
                <span className="block text-[11px] text-stone-300">POIs</span>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/10 text-center">
                <span className="text-xl font-bold text-white">{city.hotels?.length || 0}</span>
                <span className="block text-[11px] text-stone-300">Hotels</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section 1: Associated Destinations */}
        {city.destinations && city.destinations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  Destinations & Circuits in {city.cityName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Curated holiday zones connected to this hub
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {city.destinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Interactive City Map */}
        {mapMarkers.length > 0 && (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
            <MapView
              markers={mapMarkers}
              title={`Interactive Map of ${city.cityName}`}
              subtitle="Explore attractions, tourist spots, and hotels across the city region."
            />
          </section>
        )}

        {/* Section 3: Points of Interest / Sights */}
        {city.pois && city.pois.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-teal-600" />
                  City Attractions & Tourist Spots
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified sights with entry details and coordinates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {city.pois.map((poi) => (
                <PoiCard key={poi.id} poi={poi} />
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Accommodations */}
        {city.hotels && city.hotels.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-indigo-900" />
                  Hotels & Accommodations in {city.cityName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  From budget homestays to luxury properties
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {city.hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Nearby Destinations in State */}
        {city.nearbyDestinations && city.nearbyDestinations.length > 0 && (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900 flex items-center">
                  <Compass className="h-4 w-4 mr-2 text-amber-600" />
                  Other Nearby Destinations in {city.stateName}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Explore neighboring travel hubs in the same state
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {city.nearbyDestinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
