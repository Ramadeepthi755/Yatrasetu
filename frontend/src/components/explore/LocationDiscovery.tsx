'use client';

import React, { useState } from 'react';
import { Navigation, Loader2, AlertCircle, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { getNearbyPlaces, NearbyResult } from '@/lib/api';
import { DestinationCard } from './DestinationCard';
import { CityCard } from './CityCard';

export function LocationDiscovery() {
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [nearbyData, setNearbyData] = useState<NearbyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await getNearbyPlaces(lat, lng, 350, 6);
          if (res.success && res.data) {
            setNearbyData(res.data);
          } else {
            setErrorMsg('No nearby destinations found in the database for your area.');
          }
        } catch (e) {
          console.error(e);
          setErrorMsg('Failed to find places near your location. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
        } else {
          setErrorMsg('Unable to retrieve your location. You can browse all destinations manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="rounded-3xl border border-teal-200/80 bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md mb-3 border border-teal-400/30">
            <Navigation className="h-3.5 w-3.5" />
            <span>Smart Proximity Discovery</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Discover destinations & sights near you
          </h3>
          <p className="mt-1.5 text-sm text-stone-300 leading-relaxed">
            Find curated getaways, heritage circuits, and hill stations nearest to your current location across India.
          </p>
        </div>

        <div>
          {!nearbyData ? (
            <button
              onClick={requestLocation}
              disabled={loading}
              className="inline-flex items-center space-x-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Finding nearby places...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Enable Location</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setNearbyData(null)}
              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-stone-200 hover:bg-white/20 transition-colors"
            >
              Reset Location
            </button>
          )}
        </div>
      </div>

      {permissionDenied && (
        <div className="mt-4 flex items-center space-x-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-200 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <span>
            Location access was denied. You can explore all 28 states and destinations freely using the filters above!
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex items-center space-x-2 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-200 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Render Nearby Results */}
      {nearbyData && (
        <div className="mt-8 space-y-6 border-t border-white/10 pt-6">
          {nearbyData.nearbyDestinations && nearbyData.nearbyDestinations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-amber-400 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Closest Destinations to You
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nearbyData.nearbyDestinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))}
              </div>
            </div>
          )}

          {nearbyData.nearbyCities && nearbyData.nearbyCities.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-300 mb-3">
                Nearest Hub Cities
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {nearbyData.nearbyCities.slice(0, 3).map((city) => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
