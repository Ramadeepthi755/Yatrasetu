'use client';

import React, { useEffect, useState } from 'react';
import { CloudSun, Wind, Droplets, Thermometer, AlertCircle, RefreshCw, Sun, CloudRain } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

export interface WeatherSectionProps {
  latitude?: number;
  longitude?: number;
  destinationName: string;
}

interface CurrentWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

export function WeatherSection({ latitude, longitude, destinationName }: WeatherSectionProps) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    if (!latitude || !longitude) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data && data.current) {
        setWeather({
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
        });
      }
    } catch (err) {
      console.warn('Weather service degraded gracefully:', err);
      setError('Live satellite weather forecast currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
            <CloudSun className="w-4 h-4" />
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Live Weather & Climate
          </h3>
        </div>
        <ProvenanceBadge sourceType="API" sourceLabel="Live API" />
      </div>

      {loading ? (
        <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/60 dark:border-slate-800" />
      ) : error ? (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:bg-slate-900/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchWeather}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : weather ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600">
              <Thermometer className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Temperature</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">{weather.temp}°C</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Droplets className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Humidity</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">{weather.humidity}%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600">
              <Wind className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Wind Speed</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">{weather.windSpeed} km/h</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Sun className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Conditions</span>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {weather.weatherCode === 0 ? 'Clear Skies' : weather.weatherCode < 4 ? 'Partly Cloudy' : 'Moderate Weather'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
