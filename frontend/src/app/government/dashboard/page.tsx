'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  Users,
  MapPin,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Info,
  RefreshCw,
  Send,
  Layers,
  Sparkles,
  Filter,
  Eye,
  AlertCircle,
  Building2,
  Bed,
  Check,
  Activity,
  Sliders,
} from 'lucide-react';
import {
  getIntelligenceOverview,
  getDemandTrends,
  getDestinationHealthScores,
  getDemandForecast,
  getRedistributionRecommendations,
  getGovernmentMapMarkers,
  getLocalOpportunity,
  reviewRecommendation,
  recordGovernmentAction,
  IntelligenceOverview,
  DemandTrend,
  DestinationHealth,
  DemandForecast,
  RedistributionRecommendation,
  GovernmentMapMarker,
  LocalOpportunity,
} from '@/lib/api';
import { MapView, MapMarker } from '@/components/map/MapView';

export default function GovernmentDashboardPage() {
  const { role, token, isAuthenticated, openAuthModal } = useAuth();

  // Mode toggles
  const [includeDemo, setIncludeDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<IntelligenceOverview | null>(null);
  const [trends, setTrends] = useState<DemandTrend[]>([]);
  const [healthScores, setHealthScores] = useState<DestinationHealth[]>([]);
  const [recommendations, setRecommendations] = useState<RedistributionRecommendation[]>([]);
  const [mapMarkers, setMapMarkers] = useState<GovernmentMapMarker[]>([]);

  // Selection states
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('dest-1');
  const [selectedForecasts, setSelectedForecasts] = useState<DemandForecast[]>([]);
  const [loadingForecasts, setLoadingForecasts] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<LocalOpportunity | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);

  // Filters
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'HIGH_PRESSURE' | 'UNDERUTILIZED' | 'WATCH' | 'HEALTHY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Form state
  const [actionDestId, setActionDestId] = useState('dest-1');
  const [actionType, setActionType] = useState('CREATE_INITIATIVE');
  const [actionTitle, setActionTitle] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Load all intelligence data
  const loadIntelligenceData = React.useCallback(async (demoFlag = includeDemo) => {
    if (role !== 'GOVERNMENT') return;
    setError(null);
    try {
      const [ovRes, trRes, hlRes, rcRes, mpRes] = await Promise.all([
        getIntelligenceOverview(token || undefined, demoFlag),
        getDemandTrends(token || undefined, 14, demoFlag),
        getDestinationHealthScores(token || undefined, demoFlag),
        getRedistributionRecommendations(token || undefined, demoFlag),
        getGovernmentMapMarkers(token || undefined, demoFlag),
      ]);

      setOverview(ovRes.data);
      setTrends(trRes.data || []);
      setHealthScores(hlRes.data || []);
      setRecommendations(rcRes.data || []);
      setMapMarkers(mpRes.data || []);

      // If we have health scores, set initial selected destination
      if (hlRes.data && hlRes.data.length > 0 && !selectedDestinationId) {
        setSelectedDestinationId(hlRes.data[0].destinationId);
      }
    } catch (err: any) {
      console.error('Failed to load government intelligence:', err);
      setError(err.message || 'Failed to fetch government intelligence data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role, token, includeDemo, selectedDestinationId]);

  useEffect(() => {
    loadIntelligenceData(includeDemo);
  }, [loadIntelligenceData, includeDemo]);

  // Load forecast when selected destination changes
  useEffect(() => {
    if (!selectedDestinationId || role !== 'GOVERNMENT') return;
    async function loadForecastAndOpportunity() {
      setLoadingForecasts(true);
      setLoadingOpportunity(true);
      try {
        const [fcRes, oppRes] = await Promise.all([
          getDemandForecast(selectedDestinationId, token || undefined, includeDemo),
          getLocalOpportunity(selectedDestinationId, token || undefined),
        ]);
        setSelectedForecasts(fcRes.data || []);
        setSelectedOpportunity(oppRes.data || null);
      } catch (e) {
        console.error('Failed to load forecast/opportunity for destination:', e);
      } finally {
        setLoadingForecasts(false);
        setLoadingOpportunity(false);
      }
    }
    loadForecastAndOpportunity();
  }, [selectedDestinationId, token, role, includeDemo]);

  // Handle reviewing recommendation
  const handleReviewRecommendation = async (recId: string) => {
    setReviewingId(recId);
    try {
      await reviewRecommendation(recId, reviewNotes || 'Acknowledged by Regional Tourism Authority', token || undefined);
      // Update local state
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: 'REVIEWED' } : r))
      );
      setReviewNotes('');
      alert('Recommendation marked as REVIEWED.');
    } catch (e: any) {
      alert('Failed to review recommendation: ' + (e.message || 'Unknown error'));
    } finally {
      setReviewingId(null);
    }
  };

  // Handle logging official government action
  const handleRecordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) {
      alert('Please enter an action title.');
      return;
    }
    setActionSubmitting(true);
    setActionFeedback(null);
    try {
      await recordGovernmentAction(
        {
          destinationId: actionDestId,
          actionType,
          title: actionTitle,
          notes: actionNotes,
        },
        token || undefined
      );
      setActionFeedback({
        success: true,
        message: `Official Government Action "${actionTitle}" successfully logged and registered.`,
      });
      setActionTitle('');
      setActionNotes('');
    } catch (e: any) {
      setActionFeedback({
        success: false,
        message: 'Failed to record action: ' + (e.message || 'Internal error'),
      });
    } finally {
      setActionSubmitting(false);
    }
  };

  // Convert map markers to Leaflet MapMarker format
  const leafletMarkers = useMemo<MapMarker[]>(() => {
    return mapMarkers.map((m) => {
      let cat = 'Healthy Balance';
      if (m.classification === 'HIGH_PRESSURE') cat = 'High Activity Pressure';
      else if (m.classification === 'UNDERUTILIZED') cat = 'Underutilized Capacity';
      else if (m.classification === 'WATCH') cat = 'Activity Watchlist';

      return {
        id: m.destinationId,
        title: m.destinationName,
        subtitle: `${m.stateName} • ${cat} • Pressure: ${m.activityPressureScore != null ? m.activityPressureScore.toFixed(0) : 'N/A'}/100`,
        latitude: m.latitude,
        longitude: m.longitude,
        type: 'destination',
        category: cat,
      };
    });
  }, [mapMarkers]);

  // Filtered health scores
  const filteredHealth = useMemo(() => {
    return healthScores.filter((h) => {
      const matchFilter =
        healthFilter === 'ALL' ||
        (healthFilter === 'HIGH_PRESSURE' && h.classification === 'HIGH_PRESSURE') ||
        (healthFilter === 'UNDERUTILIZED' && h.classification === 'UNDERUTILIZED') ||
        (healthFilter === 'WATCH' && h.classification === 'WATCH') ||
        (healthFilter === 'HEALTHY' && h.classification === 'HEALTHY');

      const matchSearch =
        !searchQuery ||
        h.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.stateName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [healthScores, healthFilter, searchQuery]);

  // Rising destinations
  const risingDestinations = useMemo(() => {
    return trends.filter((t) => t.trend === 'RISING').slice(0, 6);
  }, [trends]);

  // Strict Server / Role Guard: Block non-government users
  if (!isAuthenticated || role !== 'GOVERNMENT') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="text-center space-y-4 max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-rose-200 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#171717]">Government Access Restricted</h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Tourism Intelligence reports and destination redistribution models are strictly restricted to verified regional tourism authorities and Ministry officials.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => openAuthModal('GOVERNMENT')}
              className="w-full py-2.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              Official Government Sign In
            </button>
            <Link
              href="/"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#171717] text-xs font-semibold rounded-xl transition-colors text-center"
            >
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. TOP BANNER: Clearance, Mode, Provenance */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-[#171717] flex items-center justify-center font-bold shadow-md">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                  Official Tourism Authority Intelligence Portal
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                  LIVE V12 INTEL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                National Tourism Intelligence Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-2xl border border-white/20">
              <span className="text-xs font-medium text-slate-200">Include Demo Signals:</span>
              <button
                type="button"
                onClick={() => setIncludeDemo(!includeDemo)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  includeDemo ? 'bg-[#F59E0B]' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    includeDemo ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                setRefreshing(true);
                loadIntelligenceData();
              }}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
              title="Refresh Intelligence Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Data Disclaimer Banner */}
        <div className="pt-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {overview?.dataDisclaimer ||
                'Data-driven insights from the YatraSetu ecosystem. All metrics are platform-derived proxies and do not represent physical crowd censuses or official government arrivals.'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Observed Signals: <strong>{overview?.observedSignalsCount ?? 278}</strong></span>
            {includeDemo && <span>Demo Signals: <strong>{overview?.demoSignalsCount ?? 180}</strong></span>}
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW KPIS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Monitored Hubs
          </span>
          <div className="text-2xl font-black text-[#1E1B4B]">
            {overview?.totalDestinationsMonitored ?? 108}
          </div>
          <span className="text-[10px] text-slate-600 font-medium">Active Circuits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Demand Signals
          </span>
          <div className="text-2xl font-black text-blue-600">
            {overview?.activeDemandSignalsCount ?? 278}
          </div>
          <span className="text-[10px] text-blue-700 font-medium">
            {includeDemo ? 'Observed + Demo' : 'Pure Observed Signals'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            High Pressure
          </span>
          <div className="text-2xl font-black text-rose-600">
            {overview?.highActivityPressureCount ?? 4}
          </div>
          <span className="text-[10px] text-rose-700 font-medium">Activity Pressure &ge; 70</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Underutilized
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {overview?.underutilizedDestinationsCount ?? 19}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Redistribution Targets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Rising Demand
          </span>
          <div className="text-2xl font-black text-amber-600">
            {overview?.risingDestinationsCount ?? 24}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">&gt; 15% 14-Day Growth</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Redistribution Ops
          </span>
          <div className="text-2xl font-black text-purple-600">
            {overview?.redistributionOpportunitiesCount ?? 5}
          </div>
          <span className="text-[10px] text-purple-700 font-medium">Corridor Suggestions</span>
        </div>
      </div>

      {/* 3. INDIA DESTINATION MAP (Visual Activity Pressure & Carrying Capacity) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <MapPin className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-[#171717]">
                Pan-India Destination Activity Pressure & Carrying Capacity Map
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Geographic distribution of destinations classified by Estimated Activity Pressure vs. absorption potential.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600" />
              <span className="text-slate-700 font-medium">High Activity Pressure (&ge;70)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-700 font-medium">Underutilized Capacity</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-700 font-medium">Watch List</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-700 font-medium">Healthy Balance</span>
            </span>
          </div>
        </div>

        <div className="w-full">
          <MapView
            markers={leafletMarkers}
            center={[21.5, 78.9]}
            zoom={5}
            className="h-[420px] w-full rounded-2xl overflow-hidden border border-slate-200"
          />
        </div>
      </div>

      {/* 4. DEMAND TRENDS & RISING DESTINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rising Demand Destinations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Rising Demand Destinations</h3>
                <p className="text-xs text-slate-500">14-day velocity and emerging platform search interest</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
              {risingDestinations.length} Fast-Moving Hubs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {risingDestinations.map((t) => (
              <div
                key={t.destinationId}
                onClick={() => setSelectedDestinationId(t.destinationId)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDestinationId === t.destinationId
                    ? 'border-[#312E81] bg-indigo-50/50 ring-2 ring-[#312E81]/20'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#171717]">{t.destinationName}</h4>
                    <span className="text-[11px] text-slate-500">{t.stateName}</span>
                  </div>
                  <span className="flex items-center text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{t.growthPercentage.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Demand Score</span>
                    <div className="font-bold text-slate-800">{t.demandScore.toFixed(0)}/100</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Source Type</span>
                    <div className="font-bold text-slate-800">{t.sourceType}</div>
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 italic">
                  &ldquo;{t.explanation}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: High Pressure vs Underutilized Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Activity className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-[#171717]">Carrying Capacity Imbalance</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comparison between hubs facing High Activity Pressure and nearby secondary nodes with Underutilized Capacity.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                  <span>High Activity Pressure</span>
                  <span>{overview?.highActivityPressureCount ?? 4} Nodes</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  Peak strain on local heritage assets and hospitality infrastructure. Mitigation recommended.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Underutilized Capacity</span>
                  <span>{overview?.underutilizedDestinationsCount ?? 19} Nodes</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  Ample host capacity and uncrowded monuments ready to absorb redirected traveler demand.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Redistribution Objective:</span>
            </div>
            <span>
              Achieve balanced regional dispersal by driving seasonal interest toward underutilized nodes through targeted campaigns.
            </span>
          </div>
        </div>
      </div>

      {/* 5. DESTINATION HEALTH & SUSTAINABILITY PROXY MASTER TABLE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-[#171717]">
                Destination Health & Sustainability Proxy Indices
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-dimensional indices evaluating Activity Pressure, Local Opportunity, and Sustainability Proxy.
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search destination or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
            />
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['ALL', 'HIGH_PRESSURE', 'UNDERUTILIZED', 'WATCH', 'HEALTHY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHealthFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    healthFilter === cat ? 'bg-white text-[#171717] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat === 'HIGH_PRESSURE' ? 'High Pressure' : cat === 'UNDERUTILIZED' ? 'Underutilized' : cat === 'WATCH' ? 'Watch' : 'Healthy'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">Overall Health</th>
                <th className="py-3 px-3">Activity Pressure</th>
                <th className="py-3 px-3">Local Opportunity</th>
                <th className="py-3 px-3">Sustainability Proxy</th>
                <th className="py-3 px-3">Provenance</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHealth.slice(0, 12).map((h) => {
                let badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                if (h.classification === 'HIGH_PRESSURE') badgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                else if (h.classification === 'UNDERUTILIZED') badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                else if (h.classification === 'WATCH') badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <tr
                    key={h.destinationId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      selectedDestinationId === h.destinationId ? 'bg-indigo-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{h.destinationName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{h.stateName}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>
                        {h.classification}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{h.overallScore.toFixed(0)}</span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#312E81] h-full rounded-full"
                            style={{ width: `${Math.min(100, h.overallScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          h.activityPressureScore >= 70
                            ? 'text-rose-600'
                            : h.activityPressureScore <= 30
                            ? 'text-emerald-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {h.activityPressureScore.toFixed(0)} / 100
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {h.localOpportunityScore.toFixed(0)} / 100
                    </td>

                    <td className="py-3 px-3 font-semibold text-teal-700">
                      {h.sustainabilityProxyScore.toFixed(0)} / 100
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                        {h.sourceType}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedDestinationId(h.destinationId)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-[#312E81] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Showing {filteredHealth.length} destinations matching criteria.</span>
          <span className="italic">
            Proxy Note: Sustainability Proxy score represents ecosystem dispersion & host density, not physical emissions.
          </span>
        </div>
      </div>

      {/* 6. TRANSPARENT BASELINE FORECAST & LOCAL OPPORTUNITY INSPECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Transparent Baseline Forecast */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-[#312E81]">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Transparent Baseline Forecast</h3>
                <p className="text-xs text-slate-500">
                  Selected Hub: <strong>{selectedOpportunity?.destinationName || selectedDestinationId}</strong>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-[#312E81]">
              Deterministic Moving Avg
            </span>
          </div>

          {loadingForecasts ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Computing Transparent Baseline Forecast...
            </div>
          ) : selectedForecasts.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No historical demand baseline calculated for this destination yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {selectedForecasts.map((fc) => (
                <div
                  key={fc.horizonDays}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center"
                >
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    {fc.horizonDays}-Day Horizon
                  </span>
                  <div className="text-2xl font-black text-[#312E81]">
                    {fc.predictedDemand.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Confidence: <strong>{(fc.confidenceScore * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Target: {fc.forecastDate}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>Methodology & Disclaimer:</span>
            </div>
            <p className="leading-snug">
              {selectedForecasts[0]?.methodology ||
                'Deterministic baseline moving average with seasonal decay based on historical platform demand signals.'}
            </p>
            <p className="text-[10px] text-amber-700 italic">
              {selectedForecasts[0]?.disclaimer ||
                'Transparent baseline forecast derived strictly from platform activity. Not an official government prediction.'}
            </p>
          </div>
        </div>

        {/* Right: Local Opportunity Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Local Opportunity & Grassroots Capacity</h3>
                <p className="text-xs text-slate-500">
                  Verified partner supply in <strong>{selectedOpportunity?.destinationName || selectedDestinationId}</strong>
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-800">
              Opportunity Score: {selectedOpportunity?.opportunityScore.toFixed(0) ?? 'N/A'}/100
            </span>
          </div>

          {loadingOpportunity ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Aggregating verified supplier network...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Users className="w-4 h-4 mx-auto text-teal-600 mb-1" />
                <div className="text-lg font-black text-slate-900">
                  {selectedOpportunity?.verifiedHostsCount ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">Local Hosts</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Bed className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                <div className="text-lg font-black text-slate-900">
                  {selectedOpportunity?.hotelsCount ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">Registered Stays</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Sparkles className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                <div className="text-lg font-black text-slate-900">
                  {selectedOpportunity?.experiencesCount ?? 0}
                </div>
                <div className="text-[10px] text-slate-500">Experiences</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Building2 className="w-4 h-4 mx-auto text-slate-600 mb-1" />
                <div className="text-lg font-black text-slate-900">
                  {(selectedOpportunity?.restaurantsCount ?? 0) + (selectedOpportunity?.rentalProvidersCount ?? 0)}
                </div>
                <div className="text-[10px] text-slate-500">Food & Mobility</div>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">Ecosystem Rationale:</span>
            <p className="leading-snug">
              {selectedOpportunity?.explanation ||
                'Calculated by assessing local host density, hotel capacity, and heritage experiences available for travelers.'}
            </p>
            <p className="text-[10px] text-slate-400 italic">
              {selectedOpportunity?.disclaimer ||
                'Proxy score based on YatraSetu registered partners. Does not reflect all informal municipal commercial activity.'}
            </p>
          </div>
        </div>
      </div>

      {/* 7. REDISTRIBUTION OPPORTUNITIES & GOVERNMENT ACTION CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Redistribution Opportunities */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">
                  Tourism Demand Redistribution Recommendations
                </h3>
                <p className="text-xs text-slate-500">
                  Algorithmic corridors matching congested hubs with underutilized alternatives
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-800">
              {recommendations.length} Active Corridors
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {rec.sourceDestinationName}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="font-extrabold text-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {rec.targetDestinationName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.priority} PRIORITY
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        rec.status === 'REVIEWED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-snug">
                  <strong>Compatibility & Reason:</strong> {rec.reason}
                </p>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    Benefit: <strong>{rec.expectedPotentialBenefit}</strong>
                  </div>
                  <div>
                    Confidence: <strong>{(rec.confidenceScore * 100).toFixed(0)}%</strong>
                  </div>
                </div>

                {/* Review Action */}
                {rec.status !== 'REVIEWED' && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => handleReviewRecommendation(rec.id)}
                      disabled={reviewingId === rec.id}
                      className="px-3 py-1.5 bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{reviewingId === rec.id ? 'Reviewing...' : 'Mark as Reviewed'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Government Action Center */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Send className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#171717]">Government Action Center</h3>
              <p className="text-xs text-slate-500">Log policy interventions & strategic notices</p>
            </div>
          </div>

          <form onSubmit={handleRecordAction} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Target Destination
              </label>
              <select
                value={actionDestId}
                onChange={(e) => setActionDestId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              >
                {healthScores.slice(0, 25).map((h) => (
                  <option key={h.destinationId} value={h.destinationId}>
                    {h.destinationName} ({h.stateName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              >
                <option value="CREATE_INITIATIVE">Create Initiative</option>
                <option value="NOTE">Official Observation / Note</option>
                <option value="FLAG_DESTINATION">Flag Destination for Inspection</option>
                <option value="REVIEW_RECOMMENDATION">Review Recommendation</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Action Title
              </label>
              <input
                type="text"
                placeholder="e.g. Off-Peak Promotional Campaign"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Strategic Notes & Directives
              </label>
              <textarea
                rows={3}
                placeholder="Direct traveler flow via state tourism portal; coordinate with local district administration."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              />
            </div>

            <button
              type="submit"
              disabled={actionSubmitting}
              className="w-full py-2.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{actionSubmitting ? 'Logging...' : 'Register Official Action'}</span>
            </button>

            {actionFeedback && (
              <div
                className={`p-3 rounded-xl border text-[11px] ${
                  actionFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {actionFeedback.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 8. PROVENANCE & EXPLAINABILITY FOOTER */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Data Provenance & Algorithmic Explainability</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          YatraSetu Government Intelligence operates under strict data-honesty constraints:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-blue-400 block mb-1">OBSERVED</span>
            <p className="text-[11px] text-slate-400">
              Direct platform queries, itinerary saves, and partner bookings by registered travelers.
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-emerald-400 block mb-1">DERIVED</span>
            <p className="text-[11px] text-slate-400">
              Normalized supply density, verified host ratio, and geographical proximity metrics.
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-amber-400 block mb-1">BASELINE</span>
            <p className="text-[11px] text-slate-400">
              Deterministic historical exponential smoothing projections (not generative AI numbers).
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-purple-400 block mb-1">DEMO</span>
            <p className="text-[11px] text-slate-400">
              Synthetic evaluation signals strictly flagged with demo toggle and isolated from normal intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
