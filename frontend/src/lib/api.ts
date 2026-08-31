/**
 * YatraSetu API Client
 * Connects to Spring Boot backend with Bearer Authorization tokens
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  displayName?: string;
  role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT';
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  preferredLanguage?: string;
  languages?: string[];
  interests?: string[];
  travelStyle?: string;
  budgetPreference?: string;
  verified: boolean;
}

export interface PartnerProfile {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  role: 'PARTNER';
  partnerSubtype: 'LOCAL_HOST' | 'GUIDE' | 'EXPERIENCE_PROVIDER' | 'RESTAURANT' | 'HOTEL' | 'HOMESTAY' | 'ARTISAN' | 'PHOTOGRAPHER' | 'OTHER';
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  languages?: string[];
  partnerSkills?: string[];
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified: boolean;
}

export interface GovernmentOverview {
  authority: string;
  totalTravelers: number;
  totalPartners: number;
  pendingPartnerVerifications: number;
  approvedPartners: number;
  availableDestinations: number;
  message: string;
  timestamp: string;
}

export interface StateSummary {
  id: string;
  stateName: string;
  region: string;
  capitalCity?: string;
  description?: string;
  bannerImageUrl?: string;
  cityCount: number;
  destinationCount: number;
}

export interface StateDetail extends StateSummary {
  featuredDestinations: DestinationSummary[];
  popularCities: CitySummary[];
  topPois: PoiItem[];
  hotels: HotelItem[];
}

export interface CitySummary {
  id: string;
  cityName: string;
  stateId?: string;
  stateName?: string;
  districtName?: string;
  latitude: number;
  longitude: number;
  tier?: string;
  isTourismHub?: boolean;
  destinationCount: number;
  poiCount: number;
  hotelCount: number;
}

export interface CityDetail extends CitySummary {
  destinations: DestinationSummary[];
  pois: PoiItem[];
  hotels: HotelItem[];
  nearbyDestinations: DestinationSummary[];
}

export interface DestinationSummary {
  id: string;
  destinationName: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  district?: string;
  region?: string;
  latitude: number;
  longitude: number;
  popularityScore: number;
  accessibility?: string;
  tripTypes: string[];
  bestSeasons?: string;
  peakSeason?: string;
  description: string;
  heroImageUrl?: string;
  safetyRating: number;
  budgetIndicator?: string;
  hiddenGems?: string;
}

export interface DestinationDetail extends DestinationSummary {
  altitudeM?: number;
  nearestAirport?: string;
  nearestRailway?: string;
  nearestMajorCity?: string;
  nearestMajorCityDistanceKm?: number;
  roadConnectivity?: string;
  primaryAttractions: string[];
  activitiesAvailable: string[];
  uniqueExperiences?: string;
  avoidSeasons?: string;
  offSeason?: string;
  averageTemperature?: string;
  rainfallPattern?: string;
  idealFor: string[];
  idealForWhy?: string;
  specialConsiderations?: string;
  minimumDays: number;
  idealDays: number;
  maximumDays: number;
  suggestedItinerary?: string;
  accommodationTypes?: string;
  foodScene?: string;
  safetyNotes?: string;
  internetConnectivity?: string;
  mobileNetwork?: string;
  atmAvailability?: string;
  languageSpoken?: string;
  permitsRequired: boolean;
  permitsDetails?: string;
  localCulture?: string;
  festivalsEvents?: string;
  localCustoms?: string;
  shoppingHighlights?: string;
  localCuisineMustTry?: string;
  budgetRangeJson?: string;
  midRangeJson?: string;
  luxuryRangeJson?: string;
  userReviewsSummary?: string;
  recentDevelopments?: string;
  sustainabilityNotes?: string;
  topPois: PoiItem[];
  nearbyHotels: HotelItem[];
  recentReviews: ReviewItem[];
}

export interface PoiItem {
  id: string;
  poiName: string;
  destinationId?: string;
  destinationName?: string;
  cityId?: string;
  cityName?: string;
  category?: string;
  latitude: number;
  longitude: number;
  tags: string[];
  characteristics?: string;
  entryFeeInr?: number;
  typicalDurationHours?: number;
}

export interface HotelItem {
  id: string;
  hotelName: string;
  cityId?: string;
  cityName?: string;
  destinationId?: string;
  destinationName?: string;
  hotelRating: number;
  pricePerNight: number;
  amenities: string[];
  category?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPartnerProperty?: boolean;
}

export interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  entityType: string;
  entityId: string;
  rating: number;
  reviewText: string;
  isVerifiedBooking: boolean;
  isImportedDataset: boolean;
  sentimentCategory?: string;
  createdAt: string;
}

export interface SearchResults {
  query: string;
  totalResults: number;
  destinations: DestinationSummary[];
  cities: CitySummary[];
  states: StateSummary[];
  pois: PoiItem[];
  hotels: HotelItem[];
}

export interface NearbyResult {
  userLatitude: number;
  userLongitude: number;
  radiusKm: number;
  nearbyDestinations: DestinationSummary[];
  nearbyCities: CitySummary[];
  nearbyPois: PoiItem[];
  nearbyHotels: HotelItem[];
}

// --------------------------------------------------------------------------
// Auth & Health API
// --------------------------------------------------------------------------

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function syncUserSession(
  authUserId: string,
  email: string,
  fullName: string,
  role: 'TRAVELER' | 'PARTNER' = 'TRAVELER',
  partnerSubtype?: string,
  token?: string
): Promise<ApiResponse<UserProfile>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/auth/sync`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      authUserId,
      email,
      fullName,
      role,
      partnerSubtype,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to sync user session (${res.status})`);
  }
  return res.json();
}

export async function getMyProfile(token?: string): Promise<ApiResponse<UserProfile>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/profile/me`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch profile: ${res.status}`);
  }
  return res.json();
}

export async function updateMyProfile(
  data: Partial<UserProfile>,
  token?: string
): Promise<ApiResponse<UserProfile>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/profile/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update profile: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerProfile(token?: string): Promise<ApiResponse<PartnerProfile>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/profile/me`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch partner profile: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerProfile(
  data: Partial<PartnerProfile>,
  token?: string
): Promise<ApiResponse<PartnerProfile>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/profile/me`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update partner profile: ${res.status}`);
  }
  return res.json();
}

export async function getGovernmentOverview(token?: string): Promise<ApiResponse<GovernmentOverview>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/overview`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch government overview: ${res.status}`);
  }
  return res.json();
}

// --------------------------------------------------------------------------
// Exploration & Discovery Public APIs (Phase 3)
// --------------------------------------------------------------------------

export async function getStates(region?: string): Promise<ApiResponse<StateSummary[]>> {
  const url = region && region !== 'all'
    ? `${API_BASE_URL}/states?region=${encodeURIComponent(region)}`
    : `${API_BASE_URL}/states`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch states: ${res.status}`);
  return res.json();
}

export async function getStateDetail(stateId: string): Promise<ApiResponse<StateDetail>> {
  const res = await fetch(`${API_BASE_URL}/states/${encodeURIComponent(stateId)}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error('State not found');
    throw new Error(`Failed to fetch state: ${res.status}`);
  }
  return res.json();
}

export async function getCities(stateId?: string): Promise<ApiResponse<CitySummary[]>> {
  const url = stateId
    ? `${API_BASE_URL}/cities?stateId=${encodeURIComponent(stateId)}`
    : `${API_BASE_URL}/cities`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch cities: ${res.status}`);
  return res.json();
}

export async function getCityDetail(cityId: string): Promise<ApiResponse<CityDetail>> {
  const res = await fetch(`${API_BASE_URL}/cities/${encodeURIComponent(cityId)}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error('City not found');
    throw new Error(`Failed to fetch city: ${res.status}`);
  }
  return res.json();
}

export async function getDestinations(params?: {
  stateId?: string;
  region?: string;
  category?: string;
  minPopularity?: number;
  search?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageResponse<DestinationSummary>>> {
  const query = new URLSearchParams();
  if (params?.stateId && params.stateId !== 'all') query.set('stateId', params.stateId);
  if (params?.region && params.region !== 'all') query.set('region', params.region);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.minPopularity) query.set('minPopularity', params.minPopularity.toString());
  if (params?.search) query.set('search', params.search);
  if (params?.page !== undefined) query.set('page', params.page.toString());
  if (params?.size !== undefined) query.set('size', params.size.toString());

  const res = await fetch(`${API_BASE_URL}/destinations?${query.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destinations: ${res.status}`);
  return res.json();
}

export async function getFeaturedDestinations(limit: number = 8): Promise<ApiResponse<DestinationSummary[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/featured?limit=${limit}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch featured destinations: ${res.status}`);
  return res.json();
}

export async function getTrendingDestinations(limit: number = 8): Promise<ApiResponse<DestinationSummary[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/trending?limit=${limit}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch trending destinations: ${res.status}`);
  return res.json();
}

export async function getHiddenGems(limit: number = 8): Promise<ApiResponse<DestinationSummary[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/hidden-gems?limit=${limit}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch hidden gems: ${res.status}`);
  return res.json();
}

export async function getDestinationDetail(destinationId: string): Promise<ApiResponse<DestinationDetail>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Destination not found');
    throw new Error(`Failed to fetch destination: ${res.status}`);
  }
  return res.json();
}

export async function getDestinationPois(destinationId: string): Promise<ApiResponse<PoiItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/pois`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination POIs: ${res.status}`);
  return res.json();
}

export async function getDestinationHotels(destinationId: string): Promise<ApiResponse<HotelItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/hotels`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination hotels: ${res.status}`);
  return res.json();
}

export async function searchDiscovery(query: string, category?: string, limit: number = 10): Promise<ApiResponse<SearchResults>> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (category && category !== 'all') params.set('category', category);
  params.set('limit', limit.toString());

  const res = await fetch(`${API_BASE_URL}/search?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getNearbyPlaces(lat: number, lng: number, radiusKm: number = 300, limit: number = 12): Promise<ApiResponse<NearbyResult>> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
    limit: limit.toString(),
  });
  const res = await fetch(`${API_BASE_URL}/discovery/nearby?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch nearby places: ${res.status}`);
  return res.json();
}
