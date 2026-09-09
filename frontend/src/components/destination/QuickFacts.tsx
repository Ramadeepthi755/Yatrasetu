'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Train,
  Clock,
  Car,
  IndianRupee,
  ShieldCheck,
  Plane,
  CloudSun,
  ClipboardList,
} from 'lucide-react';
import { DestinationDetail } from '@/lib/api';

interface QuickFactsProps {
  destination: DestinationDetail;
}

interface CurrentWeather {
  temp: number;
  condition: string;
}

export function QuickFacts({ destination }: QuickFactsProps) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  // Helper to parse JSON or text fields
  const parseJsonOrText = (field?: string): { name: string; distance?: string } => {
    if (!field) return { name: 'Available locally' };
    if (field.startsWith('{')) {
      try {
        const obj = JSON.parse(field);
        return {
          name: obj.name || obj.station_name || obj.airport_name || field,
          distance: obj.distance_km ? `(${obj.distance_km} km)` : undefined,
        };
      } catch {
        return { name: field };
      }
    }
    return { name: field };
  };

  const airport = parseJsonOrText(destination.nearestAirport);
  const railway = parseJsonOrText(destination.nearestRailway);

  // Best Time
  const bestTime = destination.bestSeasons
    ? destination.bestSeasons.replace(/\|/g, ', ')
    : destination.peakSeason
    ? destination.peakSeason
    : 'Oct – Mar';

  // Duration
  const duration =
    destination.idealDays
      ? `${destination.idealDays} Day${destination.idealDays > 1 ? 's' : ''}`
      : destination.minimumDays && destination.maximumDays
      ? `${destination.minimumDays} – ${destination.maximumDays} Days`
      : '1 – 2 Days';

  // Budget
  const getEstimatedBudget = () => {
    if (destination.budgetRangeJson) {
      try {
        const obj = JSON.parse(destination.budgetRangeJson);
        if (obj.total_daily_range && Array.isArray(obj.total_daily_range)) {
          return `₹${obj.total_daily_range[0].toLocaleString()} – ₹${obj.total_daily_range[1].toLocaleString()}/day`;
        }
      } catch {}
    }
    return '₹1,500 – ₹3,500/day';
  };

  // Road connectivity
  const road = destination.roadConnectivity
    ? destination.roadConnectivity.split(';')[0].split('.')[0]
    : destination.nearestMajorCity
    ? `Well connected from ${destination.nearestMajorCity}`
    : 'Good highway & road network';

  // Safety rating / note
  const safety = destination.safetyNotes
    ? destination.safetyNotes.split(';')[0].split('.')[0]
    : destination.safetyRating && destination.safetyRating >= 7.0
    ? 'Generally safe & tourist friendly'
    : 'Generally safe';

  // Live weather fetch
  useEffect(() => {
    async function loadWeather() {
      if (destination.latitude && destination.longitude) {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${destination.latitude}&longitude=${destination.longitude}&current=temperature_2m,weather_code&timezone=auto`;
          const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
          if (res.ok) {
            const data = await res.json();
            if (data?.current) {
              const code = data.current.weather_code;
              let condition = 'Partly Cloudy';
              if (code === 0) condition = 'Clear';
              else if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
              else if (code >= 51 && code <= 67) condition = 'Rain';
              else if (code >= 71) condition = 'Breezy';

              setWeather({
                temp: Math.round(data.current.temperature_2m),
                condition,
              });
            }
          }
        } catch {
          // Graceful fallback: check destination.averageTemperature
        }
      }
    }
    loadWeather();
  }, [destination.latitude, destination.longitude]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-5 md:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-900 dark:text-indigo-400" />
          <span>Quick Facts</span>
        </h2>

        {weather && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <CloudSun className="h-3.5 w-3.5 text-sky-500" />
            <span>
              {weather.temp}°C • {weather.condition}
            </span>
          </div>
        )}
      </div>

      {/* Facts 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 flex-1">
        {/* Best Time */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Best Time</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">{bestTime}</p>
          </div>
        </div>

        {/* Nearest Railway */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Train className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Nearest Railway</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">
              {railway.name} {railway.distance}
            </p>
          </div>
        </div>

        {/* Ideal Duration */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Ideal Duration</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{duration}</p>
          </div>
        </div>

        {/* By Road */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">By Road</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">{road}</p>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <IndianRupee className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Budget (Est.)</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">{getEstimatedBudget()}</p>
          </div>
        </div>

        {/* Safety */}
        <div className="flex items-start gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Safety</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">{safety}</p>
          </div>
        </div>

        {/* Nearest Airport */}
        <div className="flex items-start gap-2.5 sm:col-span-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Nearest Airport</span>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">
              {airport.name} {airport.distance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
