'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Loader2, AlertCircle, MapPin, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';
import { getNearbyPlaces, NearbyResult } from '@/lib/api';
import { DestinationCard } from './DestinationCard';
import { CityCard } from './CityCard';

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';
type GeolocationErrorType = 'permission_denied' | 'position_unavailable' | 'timeout' | 'unsupported' | 'api_error' | 'no_data';

export function LocationDiscovery() {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [errorType, setErrorType] = useState<GeolocationErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nearbyData, setNearbyData] = useState<NearbyResult | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const requestLocation = () => {
    // SSR & feature detection check
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      setStatus('error');
      setErrorType('unsupported');
      setErrorMessage('Geolocation is not supported by your browser. You can browse all destinations manually using the filters above.');
      return;
    }

    setStatus('loading');
    setErrorType(null);
    setErrorMessage(null);

    const geoOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes cached position fallback if available
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMountedRef.current) return;
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await getNearbyPlaces(lat, lng, 350, 6);
          if (!isMountedRef.current) return;

          if (res.success && res.data && (
            (res.data.nearbyDestinations && res.data.nearbyDestinations.length > 0) ||
            (res.data.nearbyCities && res.data.nearbyCities.length > 0)
          )) {
            setNearbyData(res.data);
            setStatus('success');
          } else {
            setStatus('error');
            setErrorType('no_data');
            setErrorMessage('No nearby destinations found in the database for your area. You can explore all destinations using the filters above.');
          }
        } catch (e) {
          console.error('LocationDiscovery: API error fetching nearby places', e);
          if (!isMountedRef.current) return;
          setStatus('error');
          setErrorType('api_error');
          setErrorMessage('Could not load nearby places right now. You can explore all destinations manually using the filters above.');
        }
      },
      (error) => {
        if (!isMountedRef.current) return;
        setStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setErrorType('permission_denied');
          setErrorMessage('Location permission is blocked. Allow location access for this site and try again.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorType('position_unavailable');
          setErrorMessage("Your device couldn't determine its location.");
        } else if (error.code === error.TIMEOUT) {
          setErrorType('timeout');
          setErrorMessage("We couldn't detect your location right now.");
        } else {
          setErrorType('position_unavailable');
          setErrorMessage("We couldn't detect your location right now.");
        }
      },
      geoOptions
    );
  };

  const handleReset = () => {
    setNearbyData(null);
    setStatus('idle');
    setErrorType(null);
    setErrorMessage(null);
  };

  const isLoading = status === 'loading';

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
              disabled={isLoading}
              className="inline-flex items-center space-x-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Detecting your location…</span>
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
              onClick={handleReset}
              className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-medium text-stone-200 hover:bg-white/20 transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Error / Fallback Banners */}
      {status === 'error' && errorMessage && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-stone-900/80 border border-amber-500/30 p-4 text-xs backdrop-blur-sm">
          <div className="flex items-center space-x-3 text-stone-200">
            {errorType === 'permission_denied' ? (
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-amber-400" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
            )}
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-300">
                {errorType === 'permission_denied' && 'Location Permission Required'}
                {errorType === 'timeout' && 'Location Request Timed Out'}
                {errorType === 'position_unavailable' && 'Position Unavailable'}
                {errorType === 'unsupported' && 'Geolocation Unsupported'}
                {(errorType === 'api_error' || errorType === 'no_data') && 'Notice'}
              </span>
              <p className="text-stone-300">{errorMessage}</p>
            </div>
          </div>

          {(errorType === 'timeout' || errorType === 'position_unavailable' || errorType === 'api_error') && (
            <button
              onClick={requestLocation}
              disabled={isLoading}
              className="inline-flex items-center justify-center space-x-1.5 self-start sm:self-auto rounded-xl bg-amber-500/20 px-4 py-2 font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors border border-amber-400/30 flex-shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Render Nearby Results */}
      {nearbyData && (
        <div className="mt-8 space-y-6 border-t border-white/10 pt-6">
          {nearbyData.nearbyDestinations && nearbyData.nearbyDestinations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-amber-400 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
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

