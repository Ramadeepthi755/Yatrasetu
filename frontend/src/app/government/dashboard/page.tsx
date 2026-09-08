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
  Filter,
  Eye,
  AlertCircle,
  Building2,
  Bed,
  Check,
  Activity,
  Sliders,
  Compass,
  FileText,
  HelpCircle,
  ChevronRight,
  Tag,
  Gem,
  Sparkles,
  Palette,
  Search,
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
  getGovernmentAlerts,
  getEcosystemGaps,
  getGovernmentHiddenGems,
  getDynamicRedistributionCorridors,
  getActionHistory,
  updateActionStatus,
  IntelligenceOverview,
  DemandTrend,
  DestinationHealth,
  DemandForecast,
  RedistributionRecommendation,
  GovernmentMapMarker,
  LocalOpportunity,
  GovernmentAlert,
  EcosystemGap,
  DynamicHiddenGem,
  DynamicRedistributionPair,
  GovernmentActionRecord,
  getPendingGovernmentExperiences,
  reviewGovernmentExperience,
  ExperienceItem,
  getCulturalOpportunities,
  getCulturalOpportunityOverview,
  CulturalOpportunityItem,
  CulturalOpportunityOverview,
  getCulturalGaps,
  getCulturalGapsOverview,
  getCulturalActions,
  generateCulturalActions,
  updateCulturalActionStatus,
  CulturalEcosystemGapItem,
  CulturalEcosystemGapOverview,
  CulturalGovernmentActionItem,
  getPendingGovernmentHotels,
  reviewGovernmentHotel,
  HotelItem,
} from '@/lib/api';
import { MapView, MapMarker } from '@/components/map/MapView';

export default function GovernmentDashboardPage() {
  const { role, token, isAuthenticated, openAuthModal } = useAuth();

  // Mode toggles
  const [includeDemo, setIncludeDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // V12 Data states
  const [overview, setOverview] = useState<IntelligenceOverview | null>(null);
  const [trends, setTrends] = useState<DemandTrend[]>([]);
  const [healthScores, setHealthScores] = useState<DestinationHealth[]>([]);
  const [recommendations, setRecommendations] = useState<RedistributionRecommendation[]>([]);
  const [mapMarkers, setMapMarkers] = useState<GovernmentMapMarker[]>([]);

  // Phase 15 Data states
  const [alerts, setAlerts] = useState<GovernmentAlert[]>([]);
  const [ecosystemGaps, setEcosystemGaps] = useState<EcosystemGap[]>([]);
  const [hiddenGems, setHiddenGems] = useState<DynamicHiddenGem[]>([]);
  const [dynamicCorridors, setDynamicCorridors] = useState<DynamicRedistributionPair[]>([]);
  const [actionHistory, setActionHistory] = useState<GovernmentActionRecord[]>([]);

  // Phase 21.4 Artisan Verification state
  const [pendingExperiences, setPendingExperiences] = useState<ExperienceItem[]>([]);
  const [verifyingExpId, setVerifyingExpId] = useState<string | null>(null);

  // Phase 22.2 Hotel Partner Verification state
  const [pendingHotels, setPendingHotels] = useState<HotelItem[]>([]);
  const [verifyingHotelId, setVerifyingHotelId] = useState<string | null>(null);

  // Phase 21.5 Cultural Opportunity & Supply/Demand Intelligence state
  const [culturalOpportunities, setCulturalOpportunities] = useState<CulturalOpportunityItem[]>([]);
  const [culturalOverview, setCulturalOverview] = useState<CulturalOpportunityOverview | null>(null);
  const [selectedCulturalItem, setSelectedCulturalItem] = useState<CulturalOpportunityItem | null>(null);
  const [culturalClassFilter, setCulturalClassFilter] = useState<'ALL' | 'HIGH_OPPORTUNITY' | 'MODERATE_OPPORTUNITY' | 'EMERGING_OPPORTUNITY' | 'LOWER_OPPORTUNITY' | 'INSUFFICIENT_DATA'>('ALL');
  const [culturalMatrixFilter, setCulturalMatrixFilter] = useState<'ALL' | 'HIGH_DEMAND_LOW_SUPPLY' | 'HIGH_DEMAND_HIGH_SUPPLY' | 'LOW_DEMAND_LOW_SUPPLY' | 'LOW_DEMAND_HIGH_SUPPLY'>('ALL');
  const [culturalSearchQuery, setCulturalSearchQuery] = useState('');

  // Phase 21.6 Cultural Ecosystem Gap & Government Action Engine state
  const [culturalGaps, setCulturalGaps] = useState<CulturalEcosystemGapItem[]>([]);
  const [culturalGapsOverview, setCulturalGapsOverview] = useState<CulturalEcosystemGapOverview | null>(null);
  const [culturalActions, setCulturalActions] = useState<CulturalGovernmentActionItem[]>([]);
  const [selectedCulturalAction, setSelectedCulturalAction] = useState<CulturalGovernmentActionItem | null>(null);
  const [actionGapTypeFilter, setActionGapTypeFilter] = useState<'ALL' | 'CULTURAL_EXPERIENCE_DEFICIT' | 'ARTISAN_PARTNER_DEFICIT' | 'CONNECTIVITY_GAP' | 'STAYS_DEFICIT' | 'GUIDE_HOST_DEFICIT' | 'CULTURAL_DATA_GAP'>('ALL');
  const [actionGovPriorityFilter, setActionGovPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [actionGovStatusFilter, setActionGovStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED'>('ALL');
  const [actionSearchTerm, setActionSearchTerm] = useState('');
  const [generatingActions, setGeneratingActions] = useState(false);
  const [updatingCultActionId, setUpdatingCultActionId] = useState<string | null>(null);

  // Selection states
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('dest-1');
  const [selectedForecasts, setSelectedForecasts] = useState<DemandForecast[]>([]);
  const [loadingForecasts, setLoadingForecasts] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<LocalOpportunity | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);

  // Filters
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'HIGH_PRESSURE' | 'UNDERUTILIZED' | 'WATCH' | 'HEALTHY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [gapFilter, setGapFilter] = useState<'ALL' | 'GUIDE_HOST_DEFICIT' | 'STAYS_DEFICIT' | 'EXPERIENCE_DEFICIT' | 'CONNECTIVITY_GAP'>('ALL');
  const [actionStatusFilter, setActionStatusFilter] = useState<string>('ALL');

  // Action Form state
  const [actionDestId, setActionDestId] = useState('dest-1');
  const [actionType, setActionType] = useState('CREATE_INITIATIVE');
  const [actionPriority, setActionPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [actionTitle, setActionTitle] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Status updating state for action lifecycle
  const [updatingActionId, setUpdatingActionId] = useState<string | null>(null);

  // Load all intelligence data
  const loadIntelligenceData = React.useCallback(async (demoFlag = includeDemo) => {
    if (role !== 'GOVERNMENT') return;
    setError(null);
    try {
      const [ovRes, trRes, hlRes, rcRes, mpRes, alRes, gapRes, gemRes, dynRes, histRes, expRes, cultRes, cultOvRes, cultGapsRes, cultGapsOvRes, cultActsRes, hotelRes] = await Promise.all([
        getIntelligenceOverview(token || undefined, demoFlag),
        getDemandTrends(token || undefined, 14, demoFlag),
        getDestinationHealthScores(token || undefined, demoFlag),
        getRedistributionRecommendations(token || undefined, demoFlag),
        getGovernmentMapMarkers(token || undefined, demoFlag),
        getGovernmentAlerts(token || undefined, demoFlag),
        getEcosystemGaps(token || undefined),
        getGovernmentHiddenGems(token || undefined, 12, demoFlag),
        getDynamicRedistributionCorridors(undefined, token || undefined, 12, demoFlag),
        getActionHistory(undefined, undefined, token || undefined),
        getPendingGovernmentExperiences(token || undefined).catch(() => ({ success: true, data: [] })),
        getCulturalOpportunities(token || undefined, demoFlag).catch(() => ({ success: true, data: [] })),
        getCulturalOpportunityOverview(token || undefined, demoFlag).catch(() => ({ success: true, data: null })),
        getCulturalGaps(token || undefined, demoFlag).catch(() => ({ success: true, data: [] })),
        getCulturalGapsOverview(token || undefined, demoFlag).catch(() => ({ success: true, data: null })),
        getCulturalActions(token || undefined, demoFlag).catch(() => ({ success: true, data: [] })),
        getPendingGovernmentHotels(token || undefined).catch(() => ({ success: true, data: [] })),
      ]);

      setOverview(ovRes.data);
      setTrends(trRes.data || []);
      setHealthScores(hlRes.data || []);
      setRecommendations(rcRes.data || []);
      setMapMarkers(mpRes.data || []);
      setAlerts(alRes.data || []);
      setEcosystemGaps(gapRes.data || []);
      setHiddenGems(gemRes.data || []);
      setDynamicCorridors(dynRes.data || []);
      setActionHistory(histRes.data || []);
      setPendingExperiences(expRes.data || []);
      setCulturalOpportunities(cultRes.data || []);
      setCulturalOverview(cultOvRes.data || null);
      setCulturalGaps(cultGapsRes.data || []);
      setCulturalGapsOverview(cultGapsOvRes.data || null);
      setCulturalActions(cultActsRes.data || []);
      setPendingHotels(hotelRes.data || []);

      if (cultActsRes.data && cultActsRes.data.length > 0 && !selectedCulturalAction) {
        setSelectedCulturalAction(cultActsRes.data[0]);
      }

      if (cultRes.data && cultRes.data.length > 0 && !selectedCulturalItem) {
        setSelectedCulturalItem(cultRes.data[0]);
      }

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
  }, [role, token, includeDemo, selectedDestinationId, selectedCulturalItem, selectedCulturalAction]);

  // Handle Artisan Experience Verification
  const handleVerifyExperience = async (expId: string, decision: 'APPROVED' | 'REJECTED') => {
    setVerifyingExpId(expId);
    const notesPrompt = decision === 'APPROVED'
      ? prompt('Enter optional verification/accreditation notes:', 'Authenticity verified via State Board & Artisan Pedigree.')
      : prompt('Enter reason for rejection/revision requirement:', 'Incomplete documentation or geographic mismatch.');

    if (notesPrompt === null) {
      setVerifyingExpId(null);
      return; // Cancelled
    }

    try {
      const res = await reviewGovernmentExperience(expId, decision, notesPrompt || undefined, token || undefined);
      if (res.success) {
        setPendingExperiences((prev) => prev.filter((e) => e.id !== expId));
        alert(`Experience successfully marked as ${decision}.`);
      }
    } catch (err: any) {
      alert('Failed to verify experience: ' + (err.message || 'Error'));
    } finally {
      setVerifyingExpId(null);
    }
  };

  // Handle Hotel Property Verification (Phase 22.2)
  const handleVerifyHotel = async (hotelId: string, decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    setVerifyingHotelId(hotelId);
    let notesPrompt: string | null = '';
    if (decision === 'APPROVED') {
      notesPrompt = prompt(
        'Enter optional verification/audit notes:',
        'Verified by authorized YatraSetu Government review workflow based on submitted property documentation.'
      );
    } else if (decision === 'REJECTED') {
      notesPrompt = prompt(
        'Enter reason for revision requirement / rejection:',
        'Incomplete address details, unverified contact, or geographic mismatch.'
      );
    } else {
      notesPrompt = prompt(
        'Enter reason for property suspension:',
        'Non-compliance with verified hospitality standards.'
      );
    }

    if (notesPrompt === null) {
      setVerifyingHotelId(null);
      return; // Cancelled
    }

    try {
      const payload = {
        decision,
        notes: decision === 'APPROVED' ? (notesPrompt || undefined) : undefined,
        rejectionReason: decision === 'REJECTED' || decision === 'SUSPENDED' ? (notesPrompt || undefined) : undefined,
      };
      const res = await reviewGovernmentHotel(hotelId, payload, token || undefined);
      if (res.success) {
        setPendingHotels((prev) => prev.filter((h) => h.id !== hotelId));
        alert(`Hotel property successfully marked as ${decision}.`);
      }
    } catch (err: any) {
      alert('Failed to review hotel property: ' + (err.message || 'Error'));
    } finally {
      setVerifyingHotelId(null);
    }
  };

  const distinctStateCount = useMemo(() => {
    const count = new Set(mapMarkers.map(m => m.stateName).filter(Boolean)).size;
    return count > 0 ? count : 36;
  }, [mapMarkers]);

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

  // Handle reviewing static recommendation
  const handleReviewRecommendation = async (recId: string) => {
    setReviewingId(recId);
    try {
      await reviewRecommendation(recId, reviewNotes || 'Acknowledged by Regional Tourism Authority', token || undefined);
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
      const res = await recordGovernmentAction(
        {
          destinationId: actionDestId,
          actionType,
          title: actionTitle,
          notes: actionNotes,
          priority: actionPriority,
        },
        token || undefined
      );

      if (res.data) {
        setActionHistory((prev) => [res.data, ...prev]);
      }

      setActionFeedback({
        success: true,
        message: `Official Government Action "${actionTitle}" logged as ${actionPriority} priority.`,
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

  // Handle Action Lifecycle status updates
  const handleUpdateActionStatus = async (actionId: string, newStatus: string) => {
    setUpdatingActionId(actionId);
    const resolutionNotes = prompt(`Enter resolution / progress notes for marking as ${newStatus}:`, '');
    try {
      const res = await updateActionStatus(actionId, newStatus, resolutionNotes || undefined, token || undefined);
      if (res.data) {
        setActionHistory((prev) =>
          prev.map((a) => (a.id === actionId ? res.data : a))
        );
      }
    } catch (e: any) {
      alert('Failed to update action status: ' + (e.message || 'Error'));
    } finally {
      setUpdatingActionId(null);
    }
  };

  // Phase 21.6: Handle generating/syncing cultural actions
  const handleGenerateCulturalActions = async () => {
    setGeneratingActions(true);
    try {
      const res = await generateCulturalActions(token || undefined, includeDemo);
      if (res.data) {
        setCulturalActions(res.data);
        if (res.data.length > 0) {
          setSelectedCulturalAction(res.data[0]);
        }
        // Also refresh gaps overview
        const gapsOv = await getCulturalGapsOverview(token || undefined, includeDemo).catch(() => null);
        if (gapsOv?.data) setCulturalGapsOverview(gapsOv.data);
        alert(`Successfully generated/synchronized ${res.data.length} deterministic platform-derived cultural action recommendations.`);
      }
    } catch (err: any) {
      alert('Failed to generate cultural actions: ' + (err.message || 'Error'));
    } finally {
      setGeneratingActions(false);
    }
  };

  // Phase 21.6: Handle updating status of cultural action
  const handleUpdateCulturalActionStatus = async (actionId: string, newStatus: string) => {
    setUpdatingCultActionId(actionId);
    let resolutionNotes: string | null = '';
    if (newStatus === 'RESOLVED' || newStatus === 'DISMISSED') {
      resolutionNotes = prompt(`Enter official resolution notes / rationale for marking action as ${newStatus}:`, 'Intervention initiated via District Tourism Promotion Council partner onboarding.');
      if (resolutionNotes === null) {
        setUpdatingCultActionId(null);
        return; // User cancelled
      }
    } else if (newStatus === 'IN_PROGRESS') {
      resolutionNotes = prompt('Enter optional progress notes / assigning official:', 'Assigned to Regional Tourism Development Board.');
      if (resolutionNotes === null) {
        setUpdatingCultActionId(null);
        return;
      }
    }

    try {
      const res = await updateCulturalActionStatus(actionId, newStatus, resolutionNotes || undefined, token || undefined);
      if (res.data) {
        setCulturalActions((prev) =>
          prev.map((a) => (a.id === actionId ? res.data : a))
        );
        if (selectedCulturalAction?.id === actionId) {
          setSelectedCulturalAction(res.data);
        }
        alert(`Cultural Government Action marked as ${newStatus}.`);
      }
    } catch (err: any) {
      alert('Failed to update action status: ' + (err.message || 'Error'));
    } finally {
      setUpdatingCultActionId(null);
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

  // Filtered Ecosystem Gaps
  const filteredGaps = useMemo(() => {
    if (gapFilter === 'ALL') return ecosystemGaps;
    return ecosystemGaps.filter((g) => g.gapType === gapFilter);
  }, [ecosystemGaps, gapFilter]);

  // Filtered Action History
  const filteredActions = useMemo(() => {
    if (actionStatusFilter === 'ALL') return actionHistory;
    return actionHistory.filter((a) => a.status === actionStatusFilter);
  }, [actionHistory, actionStatusFilter]);

  // Filtered Cultural Opportunities (Phase 21.5)
  const filteredCulturalOpportunities = useMemo(() => {
    return culturalOpportunities.filter((item) => {
      const matchClass =
        culturalClassFilter === 'ALL' || item.classification === culturalClassFilter;

      const matchMatrix =
        culturalMatrixFilter === 'ALL' || item.matrixCategory === culturalMatrixFilter;

      const matchSearch =
        !culturalSearchQuery ||
        item.destinationName.toLowerCase().includes(culturalSearchQuery.toLowerCase()) ||
        (item.stateName && item.stateName.toLowerCase().includes(culturalSearchQuery.toLowerCase())) ||
        (item.cityName && item.cityName.toLowerCase().includes(culturalSearchQuery.toLowerCase()));

      return matchClass && matchMatrix && matchSearch;
    });
  }, [culturalOpportunities, culturalClassFilter, culturalMatrixFilter, culturalSearchQuery]);

  // Filtered Cultural Actions (Phase 21.6)
  const filteredCulturalActions = useMemo(() => {
    return culturalActions.filter((action) => {
      const matchGap = actionGapTypeFilter === 'ALL' || action.gapType === actionGapTypeFilter;
      const matchPriority = actionGovPriorityFilter === 'ALL' || action.priority === actionGovPriorityFilter;
      const matchStatus = actionGovStatusFilter === 'ALL' || action.status === actionGovStatusFilter;
      const matchSearch =
        !actionSearchTerm ||
        action.destinationName.toLowerCase().includes(actionSearchTerm.toLowerCase()) ||
        (action.stateName && action.stateName.toLowerCase().includes(actionSearchTerm.toLowerCase())) ||
        (action.title && action.title.toLowerCase().includes(actionSearchTerm.toLowerCase())) ||
        (action.recommendedAction && action.recommendedAction.toLowerCase().includes(actionSearchTerm.toLowerCase()));

      return matchGap && matchPriority && matchStatus && matchSearch;
    });
  }, [culturalActions, actionGapTypeFilter, actionGovPriorityFilter, actionGovStatusFilter, actionSearchTerm]);

  // Phase 21.6 Cultural Action KPI counts
  const culturalActionKpis = useMemo(() => {
    const criticalCount = culturalActions.filter(a => a.priority === 'CRITICAL').length;
    const highCount = culturalActions.filter(a => a.priority === 'HIGH').length;
    const openCount = culturalActions.filter(a => a.status === 'OPEN').length;
    const inProgressCount = culturalActions.filter(a => a.status === 'IN_PROGRESS').length;
    const resolvedCount = culturalActions.filter(a => a.status === 'RESOLVED').length;
    return { criticalCount, highCount, openCount, inProgressCount, resolvedCount };
  }, [culturalActions]);

  // Rising destinations
  const risingDestinations = useMemo(() => {
    return trends.filter((t) => t.trend === 'RISING').slice(0, 6);
  }, [trends]);

  // Guard: Block non-government users
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
                  PHASE 15 INTEL
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

      {/* 2. PRIORITIZED GOVERNMENT ALERTS CENTER */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Prioritized Operational Alerts</h3>
                <p className="text-xs text-slate-500">Immediate carrying capacity and supply bottlenecks requiring attention</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs font-bold text-rose-800">
              {alerts.length} Active Alerts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.slice(0, 3).map((al) => {
              const isCrit = al.priority === 'CRITICAL';
              const isHigh = al.priority === 'HIGH';
              const badgeColor = isCrit
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : isHigh
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-blue-100 text-blue-800 border-blue-300';

              return (
                <div
                  key={al.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCrit ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeColor}`}>
                      {al.priority} • {al.alertCategory.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {al.metricLabel}: {al.metricValue}
                    </span>
                  </div>

                  <h4 className="mt-2 font-bold text-sm text-[#171717]">{al.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{al.explanation}</p>

                  <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] text-indigo-900 space-y-0.5">
                    <span className="font-semibold text-indigo-950 block">Suggested Directive:</span>
                    <span>{al.recommendedAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. OVERVIEW KPIS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Monitored Hubs
          </span>
          <div className="text-2xl font-black text-[#1E1B4B]">
            {overview?.totalDestinationsMonitored ?? 164}
          </div>
          <span className="text-[10px] text-slate-600 font-medium">All {distinctStateCount} States &amp; UTs</span>
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
            Ecosystem Gaps
          </span>
          <div className="text-2xl font-black text-amber-600">
            {ecosystemGaps.length}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Supply Bottlenecks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Dynamic Corridors
          </span>
          <div className="text-2xl font-black text-purple-600">
            {dynamicCorridors.length > 0 ? dynamicCorridors.length : (overview?.redistributionOpportunitiesCount ?? 12)}
          </div>
          <span className="text-[10px] text-purple-700 font-medium">Alternative Pairings</span>
        </div>
      </div>

      {/* 4. INDIA DESTINATION MAP */}
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
              Geographic distribution of all 164 destinations classified by Activity Pressure vs. absorption potential.
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

      {/* 5. DYNAMIC HIDDEN-GEM DISCOVERY & REDISTRIBUTION CORRIDORS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dynamic Hidden-Gem Discovery */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Gem className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Dynamic Hidden-Gem Discovery</h3>
                <p className="text-xs text-slate-500">High local capacity and attraction density with low demand concentration</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-800">
              {hiddenGems.length} Ranked Gems
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {hiddenGems.map((gem) => (
              <div
                key={gem.destinationId}
                onClick={() => setSelectedDestinationId(gem.destinationId)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDestinationId === gem.destinationId
                    ? 'border-[#312E81] bg-indigo-50/50 ring-2 ring-[#312E81]/20'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#171717]">{gem.destinationName}</h4>
                    <span className="text-[11px] text-slate-500">{gem.cityName ? `${gem.cityName}, ` : ''}{gem.stateName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Gem Score: {gem.hiddenGemScore.toFixed(0)}/100
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs border-t border-slate-100 pt-2 text-center">
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Opportunity</span>
                    <span className="font-bold text-slate-800">{gem.localOpportunityScore.toFixed(0)}/100</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Pressure</span>
                    <span className="font-bold text-slate-800">{gem.activityPressureScore.toFixed(0)}/100</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">POIs</span>
                    <span className="font-bold text-slate-800">{gem.poiCount}</span>
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-600 leading-snug">
                  {gem.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dynamic Demand Redistribution Corridors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Dynamic Redistribution Corridors</h3>
                <p className="text-xs text-slate-500">Algorithmic pairings relieving pressure from high-demand nodes</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-800">
              {dynamicCorridors.length} Corridors
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {dynamicCorridors.map((pair, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {pair.sourceDestinationName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-extrabold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {pair.targetDestinationName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded text-[10px] font-bold">
                    Compatibility: {pair.compatibilityScore.toFixed(0)}%
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-snug">
                  {pair.reason}
                </p>

                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex justify-between items-center">
                  <span>Pressure Relief Differential: <strong>+{pair.pressureDifferential.toFixed(0)} pts</strong></span>
                  <span className="text-[10px] text-slate-400 italic">Potential Dispersal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. LOCAL ECOSYSTEM GAPS MODULE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#171717]">Local Ecosystem Supply Gaps</h3>
                <p className="text-xs text-slate-500">Identified bottlenecks in local guide capacity, stays, and experiences</p>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'GUIDE_HOST_DEFICIT', 'STAYS_DEFICIT', 'EXPERIENCE_DEFICIT', 'CONNECTIVITY_GAP'] as const).map((gap) => (
              <button
                key={gap}
                onClick={() => setGapFilter(gap)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  gapFilter === gap ? 'bg-white text-[#171717] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {gap === 'ALL' ? 'All Gaps' : gap.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGaps.slice(0, 8).map((g) => {
            const isHigh = g.severity === 'HIGH';
            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border space-y-2 ${
                  isHigh ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#171717]">{g.destinationName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {g.severity}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-slate-700">
                  {g.gapType.replace('_', ' ')}
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {g.description}
                </p>

                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-indigo-900 font-medium">
                  <strong>Policy Action:</strong> {g.suggestedIntervention}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6.4 HOTEL & ACCOMMODATION PARTNER PROPERTY VERIFICATION WORKFLOW (PHASE 22.2) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#171717]">
                  Hotel &amp; Accommodation Partner Verification
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
                  PHASE 22.2 STAYS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Verify partner-submitted hotel, resort, and homestay listings with server-side ownership and geographic audit
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-bold text-indigo-900">
            {pendingHotels.length} Properties Pending Review
          </span>
        </div>

        {pendingHotels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">All partner accommodation submissions have been reviewed.</p>
            <p className="text-slate-400">No pending hotel or homestay property submissions in the verification queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingHotels.map((h) => (
              <div
                key={h.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      {h.verificationStatus || 'PENDING_REVIEW'}
                    </span>
                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {h.category?.replace(/_/g, ' ') || 'HOTEL'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#171717]">{h.hotelName}</h4>

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{h.address ? `${h.address}, ` : ''}{h.cityName}, {h.stateName}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 pt-1 space-y-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div>Owner: <strong>{h.ownerName || 'Verified Partner'}</strong></div>
                    {h.contactPhone && <div>Phone: {h.contactPhone}</div>}
                    {h.contactEmail && <div>Email: {h.contactEmail}</div>}
                    {h.officialWebsite && <div>Web: <a href={h.officialWebsite} target="_blank" rel="noreferrer" className="text-indigo-600 underline">Link</a></div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleVerifyHotel(h.id, 'REJECTED')}
                    disabled={verifyingHotelId === h.id}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerifyHotel(h.id, 'APPROVED')}
                    disabled={verifyingHotelId === h.id}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify Partner Stay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6.5 CULTURAL EXPERIENCE VERIFICATION & ACCREDITATION WORKFLOW */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#171717]">
                  Artisan &amp; Cultural Experience Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Accredit partner-submitted cultural masterclasses and verify authentic provenance
                </p>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-teal-900">
            {pendingExperiences.length} Submissions Pending Review
          </span>
        </div>

        {pendingExperiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">All partner cultural submissions have been reviewed.</p>
            <p className="text-slate-400">No pending artisan experience accreditations in the verification queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingExperiences.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      {exp.verificationStatus || 'PENDING_REVIEW'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ₹{exp.pricePerPerson}/person • {exp.durationHours} hrs
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#171717]">{exp.title}</h4>

                  {exp.culturalTraditionName && (
                    <div className="text-xs text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 flex items-center gap-1.5 font-medium">
                      <Landmark className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate">Tradition: {exp.culturalTraditionName}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {exp.description}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>Host: <strong>{exp.hostName}</strong></span>
                    <span>{exp.cityName || exp.destinationName || 'Regional Cluster'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleVerifyExperience(exp.id, 'REJECTED')}
                    disabled={verifyingExpId === exp.id}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleVerifyExperience(exp.id, 'APPROVED')}
                    disabled={verifyingExpId === exp.id}
                    className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve &amp; Accredit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6.75 CULTURAL OPPORTUNITY SCORE & SUPPLY/DEMAND INTELLIGENCE (PHASE 21.5) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Module Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shadow-sm border border-amber-100">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-800 font-extrabold uppercase tracking-wider">
                  YatraSetu Platform-Derived Intelligence
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  PHASE 21.5 CULTURAL OPPORTUNITY
                </span>
              </div>
              <h2 className="text-xl font-black text-[#171717] tracking-tight">
                Cultural Tourism Opportunity &amp; Supply/Demand Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic algorithmic model identifying destinations with authentic cultural assets, active traveler demand, and artisan experience supply headroom.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              {culturalOverview?.isDemoModeActive ? 'Demo Signals Included' : 'Pure Observed Signals (Default)'}
            </span>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-amber-50/60 to-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Avg Opportunity Score</span>
            </span>
            <div className="text-2xl font-black text-amber-950">
              {culturalOverview?.averageOpportunityScore != null ? culturalOverview.averageOpportunityScore.toFixed(1) : 'N/A'}
              <span className="text-xs text-slate-400 font-normal"> / 100</span>
            </div>
            <span className="text-[10px] text-amber-800 font-medium">Across evaluated destinations</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/60 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>High Opportunity Hubs</span>
            </span>
            <div className="text-2xl font-black text-emerald-950">
              {culturalOverview?.highOpportunityCount ?? 0}
            </div>
            <span className="text-[10px] text-emerald-800 font-medium">Score &ge; 80 (Prime Onboarding)</span>
          </div>

          <div className="bg-gradient-to-br from-rose-50/60 to-white p-4 rounded-2xl border border-rose-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Experience Deficits</span>
            </span>
            <div className="text-2xl font-black text-rose-950">
              {culturalOverview?.culturalExperienceDeficitCount ?? 0}
            </div>
            <span className="text-[10px] text-rose-800 font-medium">Tradition exists, 0 verified exps</span>
          </div>

          <div className="bg-gradient-to-br from-purple-50/60 to-white p-4 rounded-2xl border border-purple-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>GI-Rich Hubs</span>
            </span>
            <div className="text-2xl font-black text-purple-950">
              {culturalOverview?.giRichDestinationsCount ?? 0}
            </div>
            <span className="text-[10px] text-purple-800 font-medium">&ge;2 GI-Tagged craft assets</span>
          </div>
        </div>

        {/* 4-Quadrant Cultural Supply / Demand Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <span>Interactive Cultural Supply &amp; Demand Matrix</span>
              </h3>
              <p className="text-xs text-slate-500">
                Categorizes hubs based on observed traveler interest vs. active verified cultural experience capacity. Click a quadrant to filter.
              </p>
            </div>
            {culturalMatrixFilter !== 'ALL' && (
              <button
                onClick={() => setCulturalMatrixFilter('ALL')}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold underline"
              >
                Reset Matrix Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Quadrant 1: HIGH_DEMAND_LOW_SUPPLY */}
            <div
              onClick={() => setCulturalMatrixFilter(culturalMatrixFilter === 'HIGH_DEMAND_LOW_SUPPLY' ? 'ALL' : 'HIGH_DEMAND_LOW_SUPPLY')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                culturalMatrixFilter === 'HIGH_DEMAND_LOW_SUPPLY'
                  ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-300'
                  : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                  HIGH DEMAND • LOW SUPPLY
                </span>
                <span className="text-lg font-black text-rose-950">
                  {culturalOverview?.matrixDistribution?.HIGH_DEMAND_LOW_SUPPLY ?? 0}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">High Opportunity (Supply Deficit)</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Travelers actively exploring, but few or 0 verified artisan workshops listed. Prime target for artisan partner onboarding.
              </p>
            </div>

            {/* Quadrant 2: HIGH_DEMAND_HIGH_SUPPLY */}
            <div
              onClick={() => setCulturalMatrixFilter(culturalMatrixFilter === 'HIGH_DEMAND_HIGH_SUPPLY' ? 'ALL' : 'HIGH_DEMAND_HIGH_SUPPLY')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                culturalMatrixFilter === 'HIGH_DEMAND_HIGH_SUPPLY'
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-300">
                  HIGH DEMAND • HIGH SUPPLY
                </span>
                <span className="text-lg font-black text-indigo-950">
                  {culturalOverview?.matrixDistribution?.HIGH_DEMAND_HIGH_SUPPLY ?? 0}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Mature Cultural Ecosystem</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Active cultural ecosystem with multiple verified experiences. Focus on quality assurance and off-peak distribution.
              </p>
            </div>

            {/* Quadrant 3: LOW_DEMAND_LOW_SUPPLY */}
            <div
              onClick={() => setCulturalMatrixFilter(culturalMatrixFilter === 'LOW_DEMAND_LOW_SUPPLY' ? 'ALL' : 'LOW_DEMAND_LOW_SUPPLY')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                culturalMatrixFilter === 'LOW_DEMAND_LOW_SUPPLY'
                  ? 'border-slate-500 bg-slate-100 ring-2 ring-slate-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
                  LOW DEMAND • LOW SUPPLY
                </span>
                <span className="text-lg font-black text-slate-800">
                  {culturalOverview?.matrixDistribution?.LOW_DEMAND_LOW_SUPPLY ?? 0}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Early Stage / Latent Potential</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Emerging cluster requiring foundational craft documentation and state-level cultural promotion.
              </p>
            </div>

            {/* Quadrant 4: LOW_DEMAND_HIGH_SUPPLY */}
            <div
              onClick={() => setCulturalMatrixFilter(culturalMatrixFilter === 'LOW_DEMAND_HIGH_SUPPLY' ? 'ALL' : 'LOW_DEMAND_HIGH_SUPPLY')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                culturalMatrixFilter === 'LOW_DEMAND_HIGH_SUPPLY'
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LOW DEMAND • HIGH SUPPLY
                </span>
                <span className="text-lg font-black text-emerald-950">
                  {culturalOverview?.matrixDistribution?.LOW_DEMAND_HIGH_SUPPLY ?? 0}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">Cultural Depth / Underutilized</div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Rich artisan capacity and authentic workshops ready for visitors. Prime candidate for regional cultural circuits.
              </p>
            </div>
          </div>
        </div>

        {/* Master Table of Cultural Opportunity Scores */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-[#171717]">
                Destination Cultural Opportunity Registry ({filteredCulturalOpportunities.length})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Search destination, city, or state..."
                value={culturalSearchQuery}
                onChange={(e) => setCulturalSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              />

              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['ALL', 'HIGH_OPPORTUNITY', 'MODERATE_OPPORTUNITY', 'EMERGING_OPPORTUNITY', 'LOWER_OPPORTUNITY', 'INSUFFICIENT_DATA'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCulturalClassFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                      culturalClassFilter === cat ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat.replace('_OPPORTUNITY', '').replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Destination Hub</th>
                  <th className="py-3 px-3">Opportunity Score</th>
                  <th className="py-3 px-3">Traditions</th>
                  <th className="py-3 px-3">Demand (0-35)</th>
                  <th className="py-3 px-3">Supply Room (0-25)</th>
                  <th className="py-3 px-3">Gap Penalty</th>
                  <th className="py-3 px-3">Matrix Classification</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCulturalOpportunities.slice(0, 10).map((item) => {
                  const isSelected = selectedCulturalItem?.destinationId === item.destinationId;
                  let scoreBadge = 'bg-slate-100 text-slate-700';
                  if (item.score != null) {
                    if (item.score >= 80) scoreBadge = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
                    else if (item.score >= 60) scoreBadge = 'bg-indigo-100 text-indigo-900 border border-indigo-300';
                    else if (item.score >= 40) scoreBadge = 'bg-amber-100 text-amber-900 border border-amber-300';
                    else scoreBadge = 'bg-slate-100 text-slate-700 border border-slate-200';
                  }

                  let matrixPill = 'bg-slate-100 text-slate-700';
                  if (item.matrixCategory === 'HIGH_DEMAND_LOW_SUPPLY') matrixPill = 'bg-rose-50 text-rose-800 border border-rose-200';
                  else if (item.matrixCategory === 'HIGH_DEMAND_HIGH_SUPPLY') matrixPill = 'bg-indigo-50 text-indigo-800 border border-indigo-200';
                  else if (item.matrixCategory === 'LOW_DEMAND_HIGH_SUPPLY') matrixPill = 'bg-emerald-50 text-emerald-800 border border-emerald-200';

                  return (
                    <tr
                      key={item.destinationId}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{item.destinationName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {item.cityName ? `${item.cityName}, ` : ''}{item.stateName}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {item.score != null ? (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-black ${scoreBadge}`}>
                              {item.score.toFixed(1)}
                            </span>
                            <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-600 h-full rounded-full"
                                style={{ width: `${Math.min(100, item.score)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            INSUFFICIENT DATA
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {item.traditionCount} {item.giTraditionCount > 0 && <span className="text-[10px] text-purple-700 font-bold">({item.giTraditionCount} GI)</span>}
                        </div>
                        <div className="text-[10px] text-slate-400">Score: {item.traditionScore.toFixed(1)}/30</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.demandScore.toFixed(1)}</div>
                        <div className="text-[10px] text-slate-400">{item.observedDemandSignals} signals</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.supplyScore.toFixed(1)}</div>
                        <div className="text-[10px] text-slate-400">{item.verifiedExperienceCount} verified exps</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`font-semibold ${item.gapPenalty > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          -{item.gapPenalty.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${matrixPill}`}>
                          {item.matrixCategory.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          item.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-700' : item.confidence === 'MEDIUM' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.confidence}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedCulturalItem(item)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-amber-900 transition-colors"
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
        </div>

        {/* Deep Cultural Intelligence Inspector Drawer */}
        {selectedCulturalItem && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-[#171717]">
                    {selectedCulturalItem.destinationName}
                  </h4>
                  <span className="text-xs text-slate-500">
                    ({selectedCulturalItem.cityName ? `${selectedCulturalItem.cityName}, ` : ''}{selectedCulturalItem.stateName})
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Detailed Component Breakdown &amp; Platform Action Directives
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                  Opportunity Score: {selectedCulturalItem.score != null ? selectedCulturalItem.score.toFixed(1) : 'N/A'}
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                  {selectedCulturalItem.classification.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* 4-Component Score Formula Visualizer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Tradition Component</span>
                <span className="text-lg font-black text-slate-900">{selectedCulturalItem.traditionScore.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-normal"> / 30.0</span>
                <span className="text-[10px] text-slate-500 block mt-1">{selectedCulturalItem.traditionCount} heritage traditions</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Demand Component</span>
                <span className="text-lg font-black text-slate-900">{selectedCulturalItem.demandScore.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-normal"> / 35.0</span>
                <span className="text-[10px] text-slate-500 block mt-1">{selectedCulturalItem.observedDemandSignals} demand signals</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Supply Headroom</span>
                <span className="text-lg font-black text-slate-900">{selectedCulturalItem.supplyScore.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-normal"> / 25.0</span>
                <span className="text-[10px] text-slate-500 block mt-1">{selectedCulturalItem.verifiedExperienceCount} verified exps</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">4. Gap Penalty</span>
                <span className="text-lg font-black text-rose-600">-{selectedCulturalItem.gapPenalty.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-normal"> / 20.0</span>
                <span className="text-[10px] text-slate-500 block mt-1">{selectedCulturalItem.detectedGaps?.length ?? 0} deficit flags</span>
              </div>
            </div>

            {/* Explanation & Action Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Algorithmic Rationale:</span>
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {selectedCulturalItem.explanations?.map((exp, idx) => (
                    <li key={idx} className="leading-snug">{exp}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2">
                <span className="text-xs font-bold text-amber-950 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Platform Action Recommendations:</span>
                </span>
                <ul className="space-y-1 text-xs text-amber-900">
                  {selectedCulturalItem.suggestedActions?.map((act, idx) => (
                    <li key={idx} className="leading-snug">• {act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>{selectedCulturalItem.disclaimer}</span>
              <span>Generated: {selectedCulturalItem.generatedAt ? new Date(selectedCulturalItem.generatedAt).toLocaleDateString() : 'Real-time'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 6.85 CULTURAL ECOSYSTEM ACTION CENTER (PHASE 21.6) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Module Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shadow-sm border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-800 font-extrabold uppercase tracking-wider">
                  Platform-Derived Decision Support Engine
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-900 font-bold border border-indigo-300">
                  PHASE 21.6 ACTION ENGINE
                </span>
              </div>
              <h2 className="text-xl font-black text-[#171717] tracking-tight">
                Cultural Ecosystem Action Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Translates cultural opportunity scores into deterministic ecosystem gap interventions and lifecycle tracking for regional tourism authorities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateCulturalActions}
              disabled={generatingActions}
              className="px-4 py-2 bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingActions ? 'animate-spin' : ''}`} />
              <span>{generatingActions ? 'Synchronizing...' : 'Generate / Sync Actions'}</span>
            </button>
          </div>
        </div>

        {/* Section A: Action KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-rose-50/60 to-white p-4 rounded-2xl border border-rose-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Critical Gaps</span>
            </span>
            <div className="text-2xl font-black text-rose-950">
              {culturalGapsOverview?.criticalGapsCount ?? culturalActionKpis.criticalCount}
            </div>
            <span className="text-[10px] text-rose-800 font-medium">Immediate priority deficits</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50/60 to-white p-4 rounded-2xl border border-amber-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>High Priority Actions</span>
            </span>
            <div className="text-2xl font-black text-amber-950">
              {culturalActionKpis.highCount}
            </div>
            <span className="text-[10px] text-amber-800 font-medium">High opportunity / low supply</span>
          </div>

          <div className="bg-gradient-to-br from-indigo-50/60 to-white p-4 rounded-2xl border border-indigo-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Open &amp; In Progress</span>
            </span>
            <div className="text-2xl font-black text-indigo-950">
              {culturalActionKpis.openCount + culturalActionKpis.inProgressCount}
            </div>
            <span className="text-[10px] text-indigo-800 font-medium">{culturalActionKpis.inProgressCount} currently in progress</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/60 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resolved Actions</span>
            </span>
            <div className="text-2xl font-black text-emerald-950">
              {culturalActionKpis.resolvedCount}
            </div>
            <span className="text-[10px] text-emerald-800 font-medium">Interventions logged &amp; verified</span>
          </div>
        </div>

        {/* Section B, C, D: Multi-Filters & Search */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-[#171717]">
                Action Interventions Registry ({filteredCulturalActions.length})
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Search action, destination, state..."
                value={actionSearchTerm}
                onChange={(e) => setActionSearchTerm(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              />

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setActionGovStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                      actionGovStatusFilter === st ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Filter Row: Gap Type & Priority */}
          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold text-[11px]">Gap:</span>
              <select
                value={actionGapTypeFilter}
                onChange={(e) => setActionGapTypeFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              >
                <option value="ALL">All Gap Types</option>
                <option value="CULTURAL_EXPERIENCE_DEFICIT">Experience Deficit</option>
                <option value="ARTISAN_PARTNER_DEFICIT">Artisan Partner Deficit</option>
                <option value="CONNECTIVITY_GAP">Connectivity Gap</option>
                <option value="STAYS_DEFICIT">Stays Coverage Deficit</option>
                <option value="GUIDE_HOST_DEFICIT">Guide/Host Deficit</option>
                <option value="CULTURAL_DATA_GAP">Cultural Data Gap</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold text-[11px]">Priority:</span>
              <select
                value={actionGovPriorityFilter}
                onChange={(e) => setActionGovPriorityFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#312E81]"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {(actionGapTypeFilter !== 'ALL' || actionGovPriorityFilter !== 'ALL' || actionGovStatusFilter !== 'ALL' || actionSearchTerm) && (
              <button
                onClick={() => {
                  setActionGapTypeFilter('ALL');
                  setActionGovPriorityFilter('ALL');
                  setActionGovStatusFilter('ALL');
                  setActionSearchTerm('');
                }}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Section E: Action Master Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-3">Ecosystem Gap</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Opportunity</th>
                <th className="py-3 px-3">Recommended Intervention</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCulturalActions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No government actions match the selected filters. Click &ldquo;Generate / Sync Actions&rdquo; to populate from detected ecosystem gaps.
                  </td>
                </tr>
              ) : (
                filteredCulturalActions.slice(0, 10).map((act) => {
                  const isSelected = selectedCulturalAction?.id === act.id;

                  let priBadge = 'bg-slate-100 text-slate-700';
                  if (act.priority === 'CRITICAL') priBadge = 'bg-rose-100 text-rose-800 border border-rose-300 font-extrabold';
                  else if (act.priority === 'HIGH') priBadge = 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
                  else if (act.priority === 'MEDIUM') priBadge = 'bg-blue-100 text-blue-800 border border-blue-300 font-semibold';
                  else priBadge = 'bg-slate-100 text-slate-700 border border-slate-200';

                  let statusBadge = 'bg-slate-100 text-slate-700';
                  if (act.status === 'OPEN') statusBadge = 'bg-rose-50 text-rose-800 border border-rose-200';
                  else if (act.status === 'IN_PROGRESS') statusBadge = 'bg-indigo-50 text-indigo-800 border border-indigo-200';
                  else if (act.status === 'RESOLVED') statusBadge = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                  else statusBadge = 'bg-slate-100 text-slate-600 border border-slate-200';

                  return (
                    <tr
                      key={act.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{act.destinationName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {act.cityName ? `${act.cityName}, ` : ''}{act.stateName}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {act.gapType.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${priBadge}`}>
                          {act.priority}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {act.opportunityScore != null ? (
                          <span className="font-bold text-slate-900">
                            {act.opportunityScore.toFixed(0)}/100
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="line-clamp-2 text-slate-800 font-medium">
                          {act.recommendedAction}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}`}>
                          {act.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        {act.updatedAt ? new Date(act.updatedAt).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedCulturalAction(act)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-indigo-900 transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Section F: Deep Action Inspector Drawer */}
        {selectedCulturalAction && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/30 to-white border border-indigo-200/80 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-base text-[#171717]">
                    {selectedCulturalAction.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    ({selectedCulturalAction.destinationName}, {selectedCulturalAction.stateName})
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Platform-Derived Recommendation ID: <span className="font-mono text-slate-700">{selectedCulturalAction.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  selectedCulturalAction.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                  selectedCulturalAction.priority === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  Priority: {selectedCulturalAction.priority}
                </span>
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  selectedCulturalAction.status === 'OPEN' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                  selectedCulturalAction.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
                  selectedCulturalAction.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Status: {selectedCulturalAction.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Recommendation & Algorithmic Rationale */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-indigo-950 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Recommended Intervention:</span>
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {selectedCulturalAction.recommendedAction}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Intervention Rationale:</strong> {selectedCulturalAction.actionReason}
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-600" />
                  <span>Evidence &amp; Gap Context:</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedCulturalAction.evidenceSummary}
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Ecosystem Gap:</strong> {selectedCulturalAction.gapType.replace(/_/g, ' ')} ({selectedCulturalAction.severity} Severity)
                </div>
              </div>
            </div>

            {/* Action Lifecycle Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Update Action Lifecycle Status:</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedCulturalAction.updatedBy ? `Last updated by: ${selectedCulturalAction.updatedBy}` : 'Unassigned'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedCulturalAction.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateCulturalActionStatus(selectedCulturalAction.id, 'IN_PROGRESS')}
                    disabled={updatingCultActionId === selectedCulturalAction.id}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                )}

                {selectedCulturalAction.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateCulturalActionStatus(selectedCulturalAction.id, 'RESOLVED')}
                    disabled={updatingCultActionId === selectedCulturalAction.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                  >
                    Resolve with Notes
                  </button>
                )}

                {selectedCulturalAction.status !== 'DISMISSED' && (
                  <button
                    onClick={() => handleUpdateCulturalActionStatus(selectedCulturalAction.id, 'DISMISSED')}
                    disabled={updatingCultActionId === selectedCulturalAction.id}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                )}

                {selectedCulturalAction.status !== 'OPEN' && (
                  <button
                    onClick={() => handleUpdateCulturalActionStatus(selectedCulturalAction.id, 'OPEN')}
                    disabled={updatingCultActionId === selectedCulturalAction.id}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reopen
                  </button>
                )}
              </div>

              {selectedCulturalAction.resolutionNotes && (
                <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs text-slate-700">
                  <span className="font-bold text-emerald-800 block">Resolution Notes:</span>
                  <span>{selectedCulturalAction.resolutionNotes}</span>
                  {selectedCulturalAction.resolvedAt && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Resolved At: {new Date(selectedCulturalAction.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Provenance & Honesty Footer */}
            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span>{selectedCulturalAction.honestyDisclaimer}</span>
              <span className="font-mono">Provenance: PLATFORM_DERIVED ({selectedCulturalAction.dataMode})</span>
            </div>
          </div>
        )}
      </div>

      {/* 7. DESTINATION HEALTH & SUSTAINABILITY PROXY MASTER TABLE */}
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
              Multi-dimensional indices evaluating Activity Pressure, Local Opportunity, and Sustainability Proxy across all 164 nodes.
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

      {/* 8. TRANSPARENT BASELINE FORECAST & LOCAL OPPORTUNITY INSPECTION */}
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
                <Compass className="w-4 h-4 mx-auto text-amber-600 mb-1" />
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

      {/* 9. GOVERNMENT ACTION CENTER & ACTION HISTORY LIFECYCLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Log Action Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Send className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#171717]">Government Action Center</h3>
              <p className="text-xs text-slate-500">Log strategic policy directives</p>
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
                {healthScores.slice(0, 35).map((h) => (
                  <option key={h.destinationId} value={h.destinationId}>
                    {h.destinationName} ({h.stateName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                  <option value="NOTE">Official Note</option>
                  <option value="FLAG_DESTINATION">Flag Destination</option>
                  <option value="REVIEW_RECOMMENDATION">Review Rec</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={actionPriority}
                  onChange={(e) => setActionPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#312E81]"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
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
                Strategic Directives
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

        {/* Right 2 Cols: Action History Lifecycle Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Action History & Lifecycle Tracking</h3>
              <p className="text-xs text-slate-500">Audit trail of government directives and progress status</p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['ALL', 'LOGGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActionStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-lg transition-colors text-[10px] ${
                    actionStatusFilter === st ? 'bg-white text-[#171717] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredActions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No government actions logged yet. Use the form to record official directives.
              </div>
            ) : (
              filteredActions.map((act) => {
                let statusBadge = 'bg-slate-100 text-slate-700 border-slate-300';
                if (act.status === 'IN_PROGRESS') statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                else if (act.status === 'RESOLVED') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                else if (act.status === 'DISMISSED') statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-[#171717]">{act.title}</span>
                        <div className="text-[10px] text-slate-400">
                          {act.destinationName} • Logged by: {act.userFullName}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                          {act.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {act.priority}
                        </span>
                      </div>
                    </div>

                    {act.notes && (
                      <p className="text-xs text-slate-600 leading-snug">
                        {act.notes}
                      </p>
                    )}

                    {act.resolutionNotes && (
                      <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[10px] text-emerald-900">
                        <strong>Resolution Notes:</strong> {act.resolutionNotes}
                      </div>
                    )}

                    {act.status !== 'RESOLVED' && act.status !== 'DISMISSED' && (
                      <div className="pt-1 flex items-center justify-end gap-2 text-xs">
                        {act.status === 'LOGGED' && (
                          <button
                            onClick={() => handleUpdateActionStatus(act.id, 'IN_PROGRESS')}
                            disabled={updatingActionId === act.id}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateActionStatus(act.id, 'RESOLVED')}
                          disabled={updatingActionId === act.id}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 10. PROVENANCE & EXPLAINABILITY FOOTER */}
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
