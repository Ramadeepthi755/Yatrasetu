'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Plane,
  Train,
  Clock,
  Compass,
  ArrowLeft,
  Bookmark,
  Share2,
  Camera,
  Bed,
  Sparkles,
  Users,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Wifi,
  Radio,
  CreditCard,
  Languages,
  FileCheck,
  HeartHandshake,
  Bot,
  ExternalLink,
  Palette,
  Store,
} from 'lucide-react';
import {
  getDestinationDetail,
  getDestinationHosts,
  getDestinationExperiences,
  getDestinationTravelers,
  DestinationDetail,
  LocalHost,
  ExperienceItem,
  TravelerDiscovery,
} from '@/lib/api';
import { PoiCard } from '@/components/explore/PoiCard';
import { HotelCard } from '@/components/explore/HotelCard';
import TravelBuddyCard from '@/components/travel-connect/TravelBuddyCard';
import { LocalHostCard } from '@/components/explore/LocalHostCard';
import { ExperienceCard } from '@/components/explore/ExperienceCard';
import { MapView, MapMarker } from '@/components/map/MapView';
import { FamousFoodSection } from '@/components/destination/FamousFoodSection';
import { RestaurantsSection } from '@/components/destination/RestaurantsSection';
import { TransportSection } from '@/components/destination/TransportSection';
import { RentalProvidersSection } from '@/components/destination/RentalProvidersSection';
import { TravelAgenciesSection } from '@/components/destination/TravelAgenciesSection';
import { WeatherSection } from '@/components/destination/WeatherSection';
import { ProvenanceBadge } from '@/components/destination/ProvenanceBadge';
import { DestinationLocalCultureSection } from '@/components/destination/LocalCultureSection';

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.destinationId as string;

  const [destination, setDestination] = useState<DestinationDetail | null>(null);
  const [hosts, setHosts] = useState<LocalHost[]>([]);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [travelers, setTravelers] = useState<TravelerDiscovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [modalFeature, setModalFeature] = useState<string | null>(null);

  useEffect(() => {
    async function loadDestination() {
      if (!destinationId) return;
      setLoading(true);
      setError(null);
      try {
        const [destRes, hostsRes, expRes, travRes] = await Promise.allSettled([
          getDestinationDetail(destinationId),
          getDestinationHosts(destinationId),
          getDestinationExperiences(destinationId),
          getDestinationTravelers(destinationId, 6),
        ]);

        if (destRes.status === 'fulfilled' && destRes.value.success && destRes.value.data) {
          setDestination(destRes.value.data);
        } else {
          setError('Destination not found.');
        }

        if (hostsRes.status === 'fulfilled' && hostsRes.value.success && hostsRes.value.data) {
          setHosts(hostsRes.value.data);
        }

        if (expRes.status === 'fulfilled' && expRes.value.success && expRes.value.data) {
          setExperiences(expRes.value.data);
        }

        if (travRes.status === 'fulfilled' && travRes.value.success && travRes.value.data) {
          setTravelers(travRes.value.data);
        }
      } catch (err: unknown) {
        console.error(err);
        setError('Unable to load destination details. Please verify the URL or try again.');
      } finally {
        setLoading(false);
      }
    }
    loadDestination();
  }, [destinationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-500">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold uppercase tracking-wider">Loading Destination Explorer...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Destination Not Found</h2>
        <p className="mt-2 text-sm text-stone-500 max-w-md">
          {error || `We could not locate records for "${destinationId}".`}
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

  // Parse Nearest Airport / Railway JSON if structured
  let airportText = destination.nearestAirport;
  try {
    if (destination.nearestAirport && destination.nearestAirport.startsWith('{')) {
      const parsed = JSON.parse(destination.nearestAirport);
      airportText = `${parsed.name || 'Airport'} (${parsed.distance_km || 0} km)`;
    }
  } catch (_) {}

  let railwayText = destination.nearestRailway;
  try {
    if (destination.nearestRailway && destination.nearestRailway.startsWith('{')) {
      const parsed = JSON.parse(destination.nearestRailway);
      railwayText = `${parsed.name || 'Railway Station'} (${parsed.distance_km || 0} km)`;
    }
  } catch (_) {}

  // Parse Budget breakdown
  let budgetSummary = destination.budgetIndicator || '₹1,500 - ₹3,500 / day';
  let budgetRangeParsed: any = null;
  try {
    if (destination.budgetRangeJson) {
      budgetRangeParsed = JSON.parse(destination.budgetRangeJson);
    }
  } catch (_) {}

  // Build Map Markers
  const mapMarkers: MapMarker[] = [];

  // 1. Destination Centroid
  if (destination.latitude && destination.longitude) {
    mapMarkers.push({
      id: `dest-${destination.id}`,
      title: destination.destinationName,
      subtitle: `${destination.cityName || ''}, ${destination.stateName || ''}`,
      latitude: Number(destination.latitude),
      longitude: Number(destination.longitude),
      type: 'destination',
    });
  }

  // 2. POIs
  destination.topPois?.forEach((p) => {
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

  // 3. Hotels
  destination.nearbyHotels?.forEach((h) => {
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

  const hasImage = destination.heroImageUrl && destination.heroImageUrl.trim() !== '' && !imageError;

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20">
      {/* 1. Hero Gallery & Destination Title */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="relative h-80 md:h-[480px] w-full">
          {hasImage ? (
            <img
              src={destination.heroImageUrl}
              alt={`${destination.destinationName} landscape and cultural heritage, ${destination.stateName || 'India'}`}
              className="h-full w-full object-cover opacity-60"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-full w-full bg-stone-900 flex items-center justify-center">
              <span className="text-xs font-medium text-stone-500">
                Destination photography currently unavailable
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Breadcrumbs & Navigation */}
          <div className="absolute top-6 left-4 right-4 sm:left-8 sm:right-8 flex items-center justify-between z-10">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <Link
                href="/explore"
                className="inline-flex items-center space-x-1 text-stone-200 hover:text-white bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Explore India</span>
              </Link>
              {destination.stateId && (
                <Link
                  href={`/states/${destination.stateId}`}
                  className="text-stone-300 hover:text-amber-300 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"
                >
                  {destination.stateName}
                </Link>
              )}
              {destination.cityId && (
                <Link
                  href={`/cities/${destination.cityId}`}
                  className="text-stone-300 hover:text-teal-300 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"
                >
                  {destination.cityName}
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href={`/plan-trip?destinationId=${destination.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-bold rounded-full shadow-md backdrop-blur-md border border-white/20 transition-all hover:scale-105"
              >
                <Sparkles className="h-3.5 w-3.5 text-stone-950" />
                <span className="hidden sm:inline">Plan Trip with AI</span>
                <span className="sm:hidden">Plan Trip</span>
              </Link>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`rounded-full p-2.5 backdrop-blur-md border border-white/10 transition-colors ${
                  isSaved ? 'bg-amber-500 text-stone-950' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
                aria-label="Save Destination"
              >
                <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Hero Bottom Overlay */}
          <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {destination.region && (
                <span className="rounded-full bg-amber-500/90 px-3 py-0.5 text-xs font-bold text-stone-950 backdrop-blur-md">
                  {destination.region}
                </span>
              )}
              {destination.accessibility && (
                <span className="rounded-full bg-teal-500/80 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-md">
                  {destination.accessibility} Access
                </span>
              )}
              {destination.popularityScore && (
                <span className="flex items-center rounded-full bg-black/60 px-3 py-0.5 text-xs font-bold text-amber-400 backdrop-blur-md border border-amber-500/30">
                  <Star className="h-3.5 w-3.5 fill-amber-400 mr-1" />
                  {Number(destination.popularityScore).toFixed(1)} Popularity
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {destination.destinationName}
            </h1>

            <p className="mt-1 flex items-center text-xs md:text-sm text-stone-300 drop-shadow-sm">
              <MapPin className="h-4 w-4 mr-1 text-amber-400" />
              {destination.cityName && destination.district && destination.cityName.toLowerCase() !== destination.district.toLowerCase()
                ? `${destination.cityName}, ${destination.district.replace(/\s*\/\s*/g, ' & ')} District, ${destination.stateName || 'India'}`
                : `${(destination.district || destination.cityName || '').replace(/\s*\/\s*/g, ' & ')}${destination.stateName ? `, ${destination.stateName}` : ''}`}
            </p>
          </div>
        </div>
      </section>

      {/* Primary Action Buttons Bar */}
      <section className="bg-white border-b border-stone-200 sticky top-16 z-20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {destination.tripTypes && destination.tripTypes.map((type, idx) => (
              <span
                key={idx}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 border border-stone-200"
              >
                {type}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/experiences?destinationId=${destination.id}`}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 shadow-sm hover:bg-amber-400 transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span>Experiences ({experiences.length})</span>
            </Link>

            <Link
              href={`/local?destinationId=${destination.id}`}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Local People ({hosts.length})</span>
            </Link>

            <Link
              href={`/hotels?destinationId=${destination.id}`}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-800 transition-colors"
            >
              <Bed className="h-4 w-4" />
              <span>Hotels & Havelis</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Column (2/3) */}
          <div className="space-y-12 lg:col-span-2">
            {/* 1. About & Overview */}
            <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                About {destination.destinationName}
              </h2>
              <p className="text-sm md:text-base text-stone-700 leading-relaxed">
                {destination.description || `Discover the unique sights and experiences of ${destination.destinationName}.`}
              </p>

              {destination.uniqueExperiences && (
                <div className="mt-6 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center mb-1">
                    <Compass className="h-4 w-4 mr-1 text-amber-600" />
                    Signature Experience
                  </h4>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {destination.uniqueExperiences}
                  </p>
                </div>
              )}

              {destination.hiddenGems && (
                <div className="mt-4 rounded-2xl bg-teal-50 p-4 border border-teal-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center mb-1">
                    <Compass className="h-4 w-4 mr-1 text-teal-700" />
                    Hidden Gems & Secret Corners
                  </h4>
                  <p className="text-xs text-teal-950 leading-relaxed">
                    {destination.hiddenGems}
                  </p>
                </div>
              )}
            </section>

            {/* Live Weather & Forecast */}
            <WeatherSection
              latitude={destination.latitude}
              longitude={destination.longitude}
              destinationName={destination.destinationName}
            />

            {/* 2. Top Attractions & Sights */}
            {destination.topPois && destination.topPois.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                      <Camera className="h-6 w-6 mr-2 text-teal-600" />
                      Top Attractions & Sights ({destination.topPois.length})
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Key spots with entry fees and duration estimates
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {destination.topPois.map((poi) => (
                    <PoiCard key={poi.id} poi={poi} />
                  ))}
                </div>
              </section>
            )}

            {/* 3. Things to Do & Activities */}
            {destination.activitiesAvailable && destination.activitiesAvailable.length > 0 && (
              <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900 mb-4">
                  Things to Do in {destination.destinationName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.activitiesAvailable.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2.5 rounded-xl bg-stone-50 p-3 text-xs text-stone-800 border border-stone-100"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <span className="font-medium">{act}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Suggested Itinerary Blueprint */}
            {destination.suggestedItinerary && (
              <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-900" />
                    Suggested Itinerary Blueprint
                  </h2>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Ideal: {destination.idealDays || 4} Days
                  </span>
                </div>
                <p className="text-xs md:text-sm text-stone-700 whitespace-pre-line leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {destination.suggestedItinerary}
                </p>
              </section>
            )}

            {/* Famous Regional Food & Must-Try Dishes */}
            <FamousFoodSection
              destinationId={destination.id}
              destinationName={destination.destinationName}
            />

            {/* Restaurants & Dining Partners */}
            <RestaurantsSection
              destinationId={destination.id}
              destinationName={destination.destinationName}
            />

            {/* Connectivity & Logistics */}
            <TransportSection
              destinationId={destination.id}
              destinationName={destination.destinationName}
            />

            {/* Curated Experiences Section */}
            {experiences.length > 0 && (
              <section id="experiences">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                      <Compass className="h-6 w-6 mr-2 text-amber-600" />
                      Curated Experiences &amp; Walks ({experiences.length})
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Hands-on workshops, heritage trails, and local culinary walks
                    </p>
                  </div>
                  <Link
                    href={`/experiences?destinationId=${destination.id}`}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800"
                  >
                    View All Experiences →
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {experiences.map((exp) => (
                    <ExperienceCard key={exp.id} experience={exp} />
                  ))}
                </div>
              </section>
            )}

            {/* Local Culture & Traditions Section (Phase 21.3) */}
            <DestinationLocalCultureSection
              destinationId={destination.id}
              destinationName={destination.destinationName}
            />

            {/* Local People & Guides Section */}
            {hosts.length > 0 && (
              <section id="local-people">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                      <HeartHandshake className="h-6 w-6 mr-2 text-teal-700" />
                      Local People & Verified Hosts ({hosts.length})
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Connect directly with community storytelling guides and cultural hosts
                    </p>
                  </div>
                  <Link
                    href={`/local?destinationId=${destination.id}`}
                    className="text-xs font-bold text-teal-800 hover:text-teal-900"
                  >
                    View All Local Guides →
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {hosts.map((host) => (
                    <LocalHostCard key={host.id} host={host} />
                  ))}
                </div>
              </section>
            )}

            {/* 5. Interactive Map View */}
            {mapMarkers.length > 0 && (
              <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
                <MapView
                  markers={mapMarkers}
                  title={`Map of ${destination.destinationName}`}
                  subtitle="Explore the exact locations of viewpoints, attractions, and nearby stays."
                />
              </section>
            )}

            {/* 6. Hotels Nearby */}
            <section id="hotels">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                    <Bed className="h-6 w-6 mr-2 text-indigo-900" />
                    Hotels & Stays Nearby {destination.nearbyHotels && destination.nearbyHotels.length > 0 ? `(${destination.nearbyHotels.length})` : ''}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {destination.nearbyHotels && destination.nearbyHotels.length > 0
                      ? 'Property information available; live availability is not currently provided.'
                      : 'YatraSetu accommodation coverage is currently unavailable for this destination.'}
                  </p>
                </div>
                {destination.nearbyHotels && destination.nearbyHotels.length > 0 && (
                  <Link
                    href={`/hotels?destinationId=${destination.id}`}
                    className="text-xs font-bold text-indigo-900 hover:text-indigo-800"
                  >
                    Browse All Stays →
                  </Link>
                )}
              </div>

              {destination.nearbyHotels && destination.nearbyHotels.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {destination.nearbyHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-xs text-stone-500">
                  <p className="font-semibold text-stone-700 mb-1">Accommodation Coverage Notice</p>
                  YatraSetu accommodation coverage is currently unavailable for this destination. We are onboarding local homestay and hotel partners in this region.
                </div>
              )}
            </section>

            {/* Bike & Car Rentals */}
            <RentalProvidersSection
              destinationId={destination.id}
              destinationName={destination.destinationName}
            />

            {/* Authorized Travel Agencies */}
            <TravelAgenciesSection
              destinationId={destination.id}
              destinationName={destination.destinationName}
            />

            {/* 7. Travelers Heading Here (Travel Connect) */}
            <section id="travel-connect" className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Users className="h-3 w-3 text-amber-700" />
                    Travel Connect
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                    <Users className="h-6 w-6 mr-2 text-amber-700" />
                    Travelers Heading to {destination.destinationName}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Connect with fellow travelers visiting around the same time and share the journey
                  </p>
                </div>
                <Link
                  href={`/travel-connect?destinationId=${destination.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition shrink-0"
                >
                  <span>Find All Travelers</span>
                  <span>→</span>
                </Link>
              </div>

              {travelers && travelers.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {travelers.map((traveler) => (
                    <TravelBuddyCard key={traveler.id} traveler={traveler} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-amber-200 space-y-3">
                  <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-sm font-bold text-stone-900">Be the first to connect here!</h3>
                    <p className="text-xs text-stone-500">
                      Explore our Travel Connect network to discover travelers planning trips to this region.
                    </p>
                  </div>
                  <Link
                    href={`/travel-connect?destinationId=${destination.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-amber-700 transition"
                  >
                    Open Travel Connect
                  </Link>
                </div>
              )}
            </section>

            {/* 8. Reviews & Community Feedback */}
            {destination.recentReviews && destination.recentReviews.length > 0 && (
              <section className="rounded-3xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-amber-500" />
                      Traveler Reviews & Insights
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Verified feedback with clear provenance indicators
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {destination.recentReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-950">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-stone-900">{rev.userName}</span>
                            <div className="flex items-center space-x-1.5 text-[10px] text-stone-500">
                              {rev.isImportedDataset && (
                                <span className="rounded bg-stone-200/80 px-1.5 py-0.2 text-stone-600 font-medium">
                                  Imported Review
                                </span>
                              )}
                              {rev.isVerifiedBooking && (
                                <span className="rounded bg-teal-100 px-1.5 py-0.2 text-teal-800 font-medium">
                                  Verified Stay
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-xs font-bold text-amber-600">
                          <Star className="h-3 w-3 fill-amber-500 mr-1" />
                          {rev.rating}/5
                        </div>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {rev.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar: Key Facts & Infrastructure */}
          <div className="space-y-6">
            {/* Quick Facts Card */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                Key Travel Facts
              </h3>

              <div className="space-y-4 text-xs">
                {/* Best Season */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 uppercase font-semibold text-[10px]">Best Visiting Season</span>
                    <p className="font-bold text-stone-900">{destination.bestSeasons || 'October - March'}</p>
                    {destination.peakSeason && (
                      <p className="text-[11px] text-stone-500">Peak: {destination.peakSeason}</p>
                    )}
                  </div>
                </div>

                {/* Daily Budget */}
                <div className="flex items-start space-x-3">
                  <IndianRupee className="h-4 w-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 uppercase font-semibold text-[10px]">Estimated Daily Budget</span>
                    <p className="font-bold text-stone-900">{budgetSummary}</p>
                  </div>
                </div>

                {/* Safety Score */}
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 uppercase font-semibold text-[10px]">Safety Rating</span>
                    <p className="font-bold text-stone-900">{destination.safetyRating ? `${destination.safetyRating}/10` : '8.0/10'}</p>
                    {destination.safetyNotes && (
                      <p className="text-[11px] text-stone-500 leading-snug mt-0.5">{destination.safetyNotes}</p>
                    )}
                  </div>
                </div>

                {/* Ideal Days */}
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-indigo-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 uppercase font-semibold text-[10px]">Trip Duration</span>
                    <p className="font-bold text-stone-900">
                      {destination.minimumDays || 2} to {destination.idealDays || 4} days recommended
                    </p>
                  </div>
                </div>

                {/* Language */}
                {destination.languageSpoken && (
                  <div className="flex items-start space-x-3">
                    <Languages className="h-4 w-4 text-stone-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 uppercase font-semibold text-[10px]">Languages Spoken</span>
                      <p className="font-medium text-stone-800">{destination.languageSpoken}</p>
                    </div>
                  </div>
                )}

                {/* Connectivity */}
                {airportText && (
                  <div className="flex items-start space-x-3">
                    <Plane className="h-4 w-4 text-stone-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 uppercase font-semibold text-[10px]">Nearest Airport</span>
                      <p className="font-medium text-stone-800">{airportText}</p>
                    </div>
                  </div>
                )}

                {railwayText && (
                  <div className="flex items-start space-x-3">
                    <Train className="h-4 w-4 text-stone-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-stone-400 uppercase font-semibold text-[10px]">Nearest Railway</span>
                      <p className="font-medium text-stone-800">{railwayText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Local Culture & Cuisine Box */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 text-xs">
              <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2.5">
                Culture & Cuisine
              </h3>

              {destination.localCuisineMustTry && (
                <div>
                  <span className="font-bold text-amber-800">Must-Try Food:</span>
                  <p className="mt-1 text-stone-600">{destination.localCuisineMustTry}</p>
                </div>
              )}

              {destination.shoppingHighlights && (
                <div>
                  <span className="font-bold text-teal-800">Shopping Highlights:</span>
                  <p className="mt-1 text-stone-600">{destination.shoppingHighlights}</p>
                </div>
              )}

              {destination.festivalsEvents && (
                <div>
                  <span className="font-bold text-indigo-900">Festivals & Events:</span>
                  <p className="mt-1 text-stone-600">{destination.festivalsEvents}</p>
                </div>
              )}
            </div>

            {/* Future Feature Teasers */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-stone-900 p-6 text-white shadow-md space-y-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Community & Local Connect
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Connect with verified local community hosts, tea-estate guides, and fellow explorers visiting {destination.destinationName}.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setModalFeature('YatraSetu Local (Phase 6)')}
                  className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors text-left px-3 flex items-center justify-between"
                >
                  <span>Meet Verified Hosts</span>
                  <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                </button>
                <button
                  onClick={() => setModalFeature('Travel Connect (Phase 7)')}
                  className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors text-left px-3 flex items-center justify-between"
                >
                  <span>Find Travel Companions</span>
                  <ExternalLink className="h-3.5 w-3.5 text-teal-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Roadmap Information Modal */}
      {modalFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-stone-900">{modalFeature}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This feature is scheduled in the YatraSetu master roadmap. Phase 3 enables rich discovery across India, its states, cities, destinations, and interactive mapping.
            </p>
            <button
              onClick={() => setModalFeature(null)}
              className="w-full rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
