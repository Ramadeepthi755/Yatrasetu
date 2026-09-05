'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  planTrip,
  saveTrip,
  TripDto,
  TripPlanRequest,
  getDestinations,
  DestinationSummary,
} from '@/lib/api';
import {
  Sparkles,
  Calendar,
  Users,
  Wallet,
  Clock,
  MapPin,
  Landmark,
  UtensilsCrossed,
  ShieldCheck,
  CloudSun,
  Save,
  CheckCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  Info,
} from 'lucide-react';

function PlanTripContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token, isAuthenticated, openAuthModal } = useAuth();

  const preselectedDestId = searchParams.get('destinationId') || '';

  // Form State
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<string>(preselectedDestId);
  const [totalDays, setTotalDays] = useState<number>(3);
  const [travelerCount, setTravelerCount] = useState<number>(1);
  const [budgetTier, setBudgetTier] = useState<'Budget' | 'Mid-Range' | 'Luxury'>('Mid-Range');
  const [travelStyle, setTravelStyle] = useState<string>('Balanced');
  const [companions, setCompanions] = useState<string>('Solo');

  // Execution & Output State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [tripPlan, setTripPlan] = useState<TripDto | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load available curated destinations
  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await getDestinations({ page: 0, size: 100 });
        if (res.success && res.data.content) {
          setDestinations(res.data.content);
          if (!selectedDestId && res.data.content.length > 0) {
            setSelectedDestId(res.data.content[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    }
    loadDestinations();
  }, [selectedDestId]);

  // If preselectedDestId was provided in query, set it
  useEffect(() => {
    if (preselectedDestId) {
      setSelectedDestId(preselectedDestId);
    }
  }, [preselectedDestId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestId) {
      setErrorMsg('Please select a destination.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setSaveSuccess(false);

    try {
      const payload: TripPlanRequest = {
        destinationId: selectedDestId,
        totalDays,
        travelerCount,
        budgetTier,
        travelStyle,
        companions,
        saveDirectly: false,
      };

      const res = await planTrip(payload, token || undefined);
      if (res.success && res.data) {
        setTripPlan(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate trip plan';
      setErrorMsg(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated || !token) {
      openAuthModal('TRAVELER');
      return;
    }

    if (!tripPlan) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await saveTrip(tripPlan, token);
      if (res.success && res.data) {
        setSaveSuccess(true);
        setTripPlan(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save trip';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>YatraSetu Smart Trip Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            AI Day-by-Day Itineraries & Budget Transparency
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate custom travel plans verified against real Indian heritage points of interest, authentic regional cuisine, and live Open-Meteo weather.
          </p>
        </div>

        {/* Input Parameters Form */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Destination Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Target Destination
                </label>
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Select a Destination...</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.destinationName} ({d.cityName || d.stateName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Duration (Days)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTotalDays(d)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        totalDays === d
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
                      }`}
                    >
                      {d} {d === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travelers Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Travelers
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTravelerCount(num)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        travelerCount === num
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
                      }`}
                    >
                      {num} {num === 1 ? 'Solo' : 'Pax'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  Budget Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Budget', 'Mid-Range', 'Luxury'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setBudgetTier(tier)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        budgetTier === tier
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Pace */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Travel Pace
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Relaxed">Relaxed (Leisure & Deep Immersion)</option>
                  <option value="Balanced">Balanced (Standard Sightseeing)</option>
                  <option value="Fast-Paced">Fast-Paced (Cover Max Landmarks)</option>
                </select>
              </div>

              {/* Companions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Travel Companions
                </label>
                <select
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Solo">Solo Traveler</option>
                  <option value="Couple">Couple / Partner</option>
                  <option value="Family">Family with Children</option>
                  <option value="Friends">Group of Friends</option>
                </select>
              </div>
            </div>

            {/* Error Display */}
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating POIs & Generating Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Generate AI Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Itinerary Output */}
        {tripPlan && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
            {/* Destination & Weather Overview Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{tripPlan.cityName}, {tripPlan.stateName}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tripPlan.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tripPlan.totalDays} Days • {tripPlan.travelerCount} Traveler(s) • {tripPlan.budgetCategory} Tier
                  </p>
                </div>

                {/* Weather Pill */}
                {tripPlan.weatherSummary && (
                  <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-2.5 rounded-2xl">
                    <CloudSun className="w-6 h-6 text-amber-500" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {tripPlan.weatherSummary.temperatureC?.toFixed(1)}°C
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {tripPlan.weatherSummary.condition}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Live from {tripPlan.weatherSummary.source}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Trip Callout */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified POIs from official YatraSetu records. Zero fabricated listings.</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {saveSuccess ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Saved to My Trips!</span>
                      <Link href="/trips" className="underline ml-1">View Trips</Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveTrip}
                      disabled={isSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Itinerary to My Trips</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Budget Transparency Section */}
            {tripPlan.budgetBreakdown && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Transparent Budget Breakdown
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Total Estimated Budget: </span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      ₹{tripPlan.budgetBreakdown.totalBudgetInr?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Honesty Note Alert */}
                {tripPlan.budgetBreakdown.honestyNote && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{tripPlan.budgetBreakdown.honestyNote}</span>
                  </div>
                )}

                {/* Breakdown Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {tripPlan.budgetBreakdown.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {item.category}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            item.priceType === 'KNOWN'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {item.priceType}
                        </span>
                      </div>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        ₹{item.amountInr?.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Unavailable Costs Disclosure */}
                {tripPlan.budgetBreakdown.unavailablePriceItems?.length > 0 && (
                  <div className="pt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Excluded Variable Items: </span>
                    {tripPlan.budgetBreakdown.unavailablePriceItems.join(' • ')}
                  </div>
                )}
              </div>
            )}

            {/* Day-by-Day Itinerary Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Day-by-Day Verified Itinerary</span>
              </h3>

              <div className="space-y-4">
                {tripPlan.itineraries?.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4"
                  >
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                          {day.dayNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            Day {day.dayNumber}: {day.theme}
                          </h4>
                          <p className="text-xs text-gray-500">{day.notes}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Activity Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {day.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-start gap-3 hover:border-primary/40 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-600 shadow-2xs">
                            {item.itemType === 'POI' ? (
                              <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            ) : item.itemType === 'MEAL' ? (
                              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                                {item.timeSlot}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500">
                                ~{item.durationHours} hrs
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h5>
                            {item.rationale && (
                              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                {item.rationale}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                                Entry: {item.estimatedCostInr && item.estimatedCostInr > 0 ? `₹${item.estimatedCostInr}` : 'Free entry'}
                              </span>
                              {item.poiId && (
                                <span className="text-[9px] font-mono px-1 py-0.2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                  {item.poiId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanTripPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PlanTripContent />
    </Suspense>
  );
}
