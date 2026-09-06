/**
 * YatraSetu API Client
 * Connects to Spring Boot backend with Bearer Authorization tokens
 */

const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  'http://localhost:8080/api/v1';

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

export interface IntelligenceOverview {
  totalDestinationsMonitored: number;
  risingDestinationsCount: number;
  highActivityPressureCount: number;
  underutilizedDestinationsCount: number;
  activeDemandSignalsCount: number;
  redistributionOpportunitiesCount: number;
  demoModeActive: boolean;
  observedSignalsCount: number;
  demoSignalsCount: number;
  provenanceBreakdown: Record<string, string>;
  dataDisclaimer: string;
  timestamp: string;
}

export interface DemandTrend {
  destinationId: string;
  destinationName: string;
  stateName: string;
  currentDemand: number;
  previousDemand: number;
  growthPercentage: number;
  demandScore: number;
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  sourceType: 'OBSERVED' | 'DERIVED' | 'ESTIMATED' | 'DEMO' | 'OFFICIAL';
  confidence: number;
  explanation: string;
  timeSeries?: { date: string; value: number }[];
}

export interface DestinationHealth {
  destinationId: string;
  destinationName: string;
  stateName: string;
  classification: 'HEALTHY' | 'WATCH' | 'HIGH_PRESSURE' | 'UNDERUTILIZED' | 'INSUFFICIENT_DATA';
  overallScore: number;
  demandScore: number;
  activityPressureScore: number;
  localOpportunityScore: number;
  accessibilityScore: number;
  sustainabilityProxyScore: number;
  sourceType: 'OBSERVED' | 'DERIVED' | 'ESTIMATED' | 'DEMO' | 'OFFICIAL';
  confidence: number;
  explanation: string;
  scoreDate: string;
  alternativeOptionsCount: number;
  proxyDisclaimer: string;
}

export interface DemandForecast {
  destinationId: string;
  destinationName: string;
  horizonDays: number;
  forecastDate: string;
  predictedDemand: number;
  confidenceScore: number;
  modelType: string;
  sourceType: 'OBSERVED' | 'DERIVED' | 'ESTIMATED' | 'DEMO' | 'OFFICIAL';
  methodology: string;
  explanation: string;
  disclaimer: string;
  sufficientData: boolean;
}

export interface RedistributionRecommendation {
  id: string;
  sourceDestinationId: string;
  sourceDestinationName: string;
  sourceActivityPressureScore: number;
  targetDestinationId: string;
  targetDestinationName: string;
  targetLocalOpportunityScore: number;
  targetActivityPressureScore: number;
  compatibilityType: string;
  reason: string;
  expectedPotentialBenefit: string;
  confidenceScore: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'REVIEWED' | 'IMPLEMENTED' | 'DISMISSED';
  sourceType: string;
  whyExplanation: string;
  limitations: string;
}

export interface GovernmentMapMarker {
  destinationId: string;
  destinationName: string;
  stateName: string;
  latitude: number;
  longitude: number;
  classification: 'HEALTHY' | 'WATCH' | 'HIGH_PRESSURE' | 'UNDERUTILIZED' | 'INSUFFICIENT_DATA';
  overallScore?: number;
  demandScore?: number;
  activityPressureScore?: number;
  localOpportunityScore?: number;
  topRecommendationTarget?: string;
  proxyNote?: string;
}

export interface LocalOpportunity {
  destinationId: string;
  destinationName: string;
  opportunityScore: number;
  verifiedHostsCount: number;
  hotelsCount: number;
  experiencesCount: number;
  restaurantsCount: number;
  rentalProvidersCount: number;
  sourceType: string;
  explanation: string;
  disclaimer: string;
}

export interface GovernmentAlert {
  id: string;
  alertCategory: 'CRITICAL_PRESSURE' | 'SUPPLY_BOTTLENECK' | 'UNDERUTILIZED_ASSET' | 'WATCHLIST';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  destinationId: string;
  destinationName: string;
  stateName: string;
  metricValue: number;
  metricLabel: string;
  title: string;
  explanation: string;
  recommendedAction: string;
  sourceType: string;
  timestamp: string;
}

export interface EcosystemGap {
  id: string;
  destinationId: string;
  destinationName: string;
  stateName: string;
  cityName: string;
  gapType: 'GUIDE_HOST_DEFICIT' | 'STAYS_DEFICIT' | 'EXPERIENCE_DEFICIT' | 'CONNECTIVITY_GAP';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  suggestedIntervention: string;
  observedDemand: number;
  hostCount: number;
  hotelCount: number;
  experienceCount: number;
  sourceType: string;
  detectedAt: string;
  disclaimer: string;
}

export interface DynamicHiddenGem {
  destinationId: string;
  destinationName: string;
  stateName: string;
  cityName: string;
  classification: string;
  demandScore: number;
  activityPressureScore: number;
  localOpportunityScore: number;
  accessibilityScore: number;
  sustainabilityProxyScore: number;
  poiCount: number;
  tripTypes: string[];
  hiddenGemScore: number;
  explanation: string;
  sourceType: string;
  disclaimer: string;
}

export interface DynamicRedistributionPair {
  sourceDestinationId: string;
  sourceDestinationName: string;
  sourceStateName: string;
  sourceActivityPressureScore: number;
  sourceDemandScore: number;
  targetDestinationId: string;
  targetDestinationName: string;
  targetStateName: string;
  targetActivityPressureScore: number;
  targetLocalOpportunityScore: number;
  pressureDifferential: number;
  compatibilityScore: number;
  sharedThemes: string[];
  reason: string;
  expectedPotentialBenefit: string;
  sourceType: string;
  limitationsDisclaimer: string;
}

export interface GovernmentActionRecord {
  id: string;
  destinationId?: string;
  destinationName: string;
  stateName: string;
  recommendationId?: string;
  actionType: string;
  title: string;
  notes?: string;
  status: 'LOGGED' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionNotes?: string;
  resolvedAt?: string;
  userFullName: string;
  createdAt: string;
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
  ownerId?: string;
  ownerName?: string;
  cityId?: string;
  cityName?: string;
  stateId?: string;
  stateName?: string;
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
  inventoryType?: string;
  sourceType?: string;
  sourceLabel?: string;
  verificationStatus?: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  bookabilityStatus?: 'BOOKABLE' | 'PENDING_VERIFICATION' | 'VERIFIED_BUT_INCOMPLETE' | 'VERIFIED_BUT_INACTIVE' | 'UNVERIFIED' | 'REJECTED' | 'SUSPENDED' | 'NOT_READY';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  contactPhone?: string;
  contactEmail?: string;
  officialWebsite?: string;
  checkInTime?: string;
  checkOutTime?: string;
  isDemoData?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerHotelAnalyticsDto {
  hotelId: string;
  hotelName: string;
  verificationStatus: string;
  bookabilityStatus: string;
  isBookable: boolean;
  totalBookingsCount: number;
  confirmedBookingsCount: number;
  pendingPaymentCount: number;
  cancelledBookingsCount: number;
  expiredBookingsCount: number;
  reservedRoomNights: number;
  paidBookingValue: number;
  currency: string;
  totalRoomTypesCount: number;
  activeRoomTypesCount: number;
  activeRatePlansCount: number;
  inventoryCoverageDays: number;
  inventoryBlockedDays: number;
  platformValueDisclosure: string;
  missingSetupSteps: string[];
}

export interface HotelInventoryCalendarDto {
  date: string;
  roomTypeId: string;
  roomTypeName: string;
  totalUnits: number;
  blockedUnits: number;
  reservedUnits: number;
  availableUnits: number;
  isDateSpecific?: boolean;
}

export interface CreateHotelRequest {
  hotelName: string;
  cityId: string;
  destinationId?: string;
  category?: string;
  pricePerNight: number;
  address?: string;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  officialWebsite?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface UpdateHotelRequest {
  hotelName?: string;
  cityId?: string;
  destinationId?: string;
  category?: string;
  pricePerNight?: number;
  address?: string;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  officialWebsite?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface HotelVerificationRequest {
  decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  notes?: string;
  rejectionReason?: string;
}

export interface HotelRoomTypeItem {
  id: string;
  hotelId: string;
  hotelName?: string;
  roomTypeName: string;
  description?: string;
  maxOccupancy: number;
  bedConfiguration?: string;
  roomSizeSqft?: number;
  amenities: string[];
  isAccessible: boolean;
  baseInventoryUnits: number;
  sourceType: string;
  isActive: boolean;
  isDemoData?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomTypeRequest {
  roomTypeName: string;
  description?: string;
  maxOccupancy: number;
  bedConfiguration?: string;
  roomSizeSqft?: number;
  amenities?: string[];
  isAccessible?: boolean;
  baseInventoryUnits: number;
  isActive?: boolean;
}

export interface UpdateRoomTypeRequest {
  roomTypeName?: string;
  description?: string;
  maxOccupancy?: number;
  bedConfiguration?: string;
  roomSizeSqft?: number;
  amenities?: string[];
  isAccessible?: boolean;
  baseInventoryUnits?: number;
  isActive?: boolean;
}

export interface HotelInventoryItem {
  id: string;
  roomTypeId: string;
  roomTypeName?: string;
  hotelId?: string;
  inventoryDate?: string;
  totalUnits: number;
  blockedUnits: number;
  sourceType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateInventoryRequest {
  inventoryDate?: string;
  totalUnits: number;
  blockedUnits?: number;
}

export interface HotelRatePlanItem {
  id: string;
  roomTypeId: string;
  roomTypeName?: string;
  hotelId?: string;
  hotelName?: string;
  planName: string;
  mealPlan: 'EP' | 'CP' | 'MAP' | 'AP';
  description?: string;
  basePrice: number;
  currency: string;
  priceUnit: string;
  validFrom?: string;
  validTo?: string;
  cancellationPolicy: 'FREE_CANCELLATION' | 'NON_REFUNDABLE' | 'PARTIAL_REFUND' | 'CUSTOM';
  cancellationDeadlineHours: number;
  cancellationFeeType?: 'NONE' | 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIRST_NIGHT';
  cancellationFeeValue?: number;
  taxesIncluded: boolean;
  feesIncluded: boolean;
  sourceType: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  isDemoData?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRatePlanRequest {
  planName: string;
  mealPlan: string;
  description?: string;
  basePrice: number;
  currency?: string;
  priceUnit?: string;
  validFrom?: string;
  validTo?: string;
  cancellationPolicy?: string;
  cancellationDeadlineHours?: number;
  cancellationFeeType?: string;
  cancellationFeeValue?: number;
  taxesIncluded?: boolean;
  feesIncluded?: boolean;
  status?: string;
}

export interface UpdateRatePlanRequest {
  planName?: string;
  mealPlan?: string;
  description?: string;
  basePrice?: number;
  currency?: string;
  priceUnit?: string;
  validFrom?: string;
  validTo?: string;
  cancellationPolicy?: string;
  cancellationDeadlineHours?: number;
  cancellationFeeType?: string;
  cancellationFeeValue?: number;
  taxesIncluded?: boolean;
  feesIncluded?: boolean;
  status?: string;
}



export interface FamousFoodItem {
  id: string;
  destinationId: string;
  dishName: string;
  description?: string;
  isVegetarian?: boolean;
  cuisineType?: string;
  imageUrl?: string;
  sourceType: 'DATASET' | 'OFFICIAL' | 'API' | 'PARTNER_SUBMITTED' | 'USER_GENERATED' | 'DEMO';
  sourceLabel: string;
}

export interface RestaurantItem {
  id: string;
  destinationId: string;
  name: string;
  cuisineType?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewsCount?: number;
  isVerified?: boolean;
  sourceType: 'DATASET' | 'OFFICIAL' | 'API' | 'PARTNER_SUBMITTED' | 'USER_GENERATED' | 'DEMO';
  sourceLabel: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  priceRange?: string;
}

export interface DestinationTransportItem {
  id: string;
  destinationId: string;
  mode: 'AIRPORT' | 'RAILWAY' | 'BUS_ROAD' | 'LOCAL_AUTO' | 'METRO' | 'TAXI' | 'FERRY';
  name: string;
  distanceKm?: number;
  description?: string;
  roadCondition?: string;
  priceType: 'PRICE_UNAVAILABLE' | 'ESTIMATED_PRICE' | 'EXACT_FARE';
  estimatedFareInr?: number;
  sourceType: 'DATASET' | 'OFFICIAL' | 'API' | 'PARTNER_SUBMITTED' | 'USER_GENERATED' | 'DEMO';
  sourceLabel: string;
}

export interface TravelAgencyItem {
  id: string;
  destinationId: string;
  agencyName: string;
  licenseNumber?: string;
  address?: string;
  servicesOffered?: string;
  rating?: number;
  isVerified?: boolean;
  sourceType: 'DATASET' | 'OFFICIAL' | 'API' | 'PARTNER_SUBMITTED' | 'USER_GENERATED' | 'DEMO';
  sourceLabel: string;
  phone?: string;
  website?: string;
}

export interface RentalProviderItem {
  id: string;
  destinationId: string;
  providerName: string;
  vehicleTypes?: string;
  address?: string;
  isVerified?: boolean;
  sourceType: 'DATASET' | 'OFFICIAL' | 'API' | 'PARTNER_SUBMITTED' | 'USER_GENERATED' | 'DEMO';
  sourceLabel: string;
  phone?: string;
  website?: string;
}

export interface DestinationEcosystem {
  destinationId: string;
  destinationName: string;
  famousFoods: FamousFoodItem[];
  restaurants: RestaurantItem[];
  transports: DestinationTransportItem[];
  agencies: TravelAgencyItem[];
  rentalProviders: RentalProviderItem[];
  hotels: HotelItem[];
  pois: PoiItem[];
  localGuides: LocalHost[];
  experiences: ExperienceItem[];
}

export interface LocalHost {
  id: string;
  userId?: string;
  name: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  destinationId?: string;
  destinationName?: string;
  languages: string[];
  skills: string[];
  interests: string[];
  roleTitle: string;
  pricePerHour: number;
  rating: number;
  experienceCount: number;
  availability: string;
  isVerified: boolean;
  isDemoData: boolean;
  about?: string;
  avatarUrl?: string;
}

export interface ExperienceItem {
  id: string;
  hostId: string;
  hostName: string;
  hostRoleTitle?: string;
  hostAvatarUrl?: string;
  hostRating?: number;
  hostCityName?: string;
  destinationId?: string;
  destinationName?: string;
  cityId?: string;
  cityName?: string;
  title: string;
  description: string;
  category: string;
  durationHours: number;
  pricePerPerson: number;
  maxGroupSize: number;
  includedItems: string[];
  requirements?: string;
  languages: string[];
  coverImageUrl?: string;
  isApproved: boolean;
  isActive: boolean;
  isDemoData: boolean;
  culturalTraditionId?: string;
  culturalTraditionName?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED';
  verificationStatus?: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface LocalHostDetail extends LocalHost {
  experiences: ExperienceItem[];
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
// Government Tourism Intelligence APIs (V12)
// --------------------------------------------------------------------------

export async function getIntelligenceOverview(token?: string, includeDemo = false): Promise<ApiResponse<IntelligenceOverview>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/overview?includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch intelligence overview: ${res.status}`);
  }
  return res.json();
}

export async function getDemandTrends(token?: string, windowDays = 14, includeDemo = false): Promise<ApiResponse<DemandTrend[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/demand?windowDays=${windowDays}&includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch demand trends: ${res.status}`);
  }
  return res.json();
}

export async function getMacroTimeSeries(token?: string, days = 30, includeDemo = false): Promise<ApiResponse<{ date: string; value: number }[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/demand/timeseries?days=${days}&includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch macro time series: ${res.status}`);
  }
  return res.json();
}

export async function getDestinationHealthScores(token?: string, includeDemo = false): Promise<ApiResponse<DestinationHealth[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/destinations?includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch destination health scores: ${res.status}`);
  }
  return res.json();
}

export async function getDestinationHealth(id: string, token?: string, includeDemo = false): Promise<ApiResponse<DestinationHealth>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/destinations/${id}?includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch destination health for ${id}: ${res.status}`);
  }
  return res.json();
}

export async function getDemandForecast(destinationId: string, token?: string, includeDemo = false): Promise<ApiResponse<DemandForecast[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/forecast?destinationId=${encodeURIComponent(destinationId)}&includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch forecast: ${res.status}`);
  }
  return res.json();
}

export async function getRedistributionRecommendations(token?: string, includeDemo = false): Promise<ApiResponse<RedistributionRecommendation[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/redistribution?includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch redistribution recommendations: ${res.status}`);
  }
  return res.json();
}

export async function getGovernmentMapMarkers(token?: string, includeDemo = false): Promise<ApiResponse<GovernmentMapMarker[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/map?includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch government map markers: ${res.status}`);
  }
  return res.json();
}

export async function getLocalOpportunity(destinationId: string, token?: string): Promise<ApiResponse<LocalOpportunity>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/local-opportunity?destinationId=${encodeURIComponent(destinationId)}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch local opportunity: ${res.status}`);
  }
  return res.json();
}

export async function reviewRecommendation(id: string, notes?: string, token?: string): Promise<ApiResponse<string>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = notes
    ? `${API_BASE_URL}/government/intelligence/recommendations/${id}/review?notes=${encodeURIComponent(notes)}`
    : `${API_BASE_URL}/government/intelligence/recommendations/${id}/review`;

  const res = await fetch(url, { method: 'POST', headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to review recommendation: ${res.status}`);
  }
  return res.json();
}

export async function recordGovernmentAction(
  action: { destinationId?: string; recommendationId?: string; actionType: string; title: string; notes?: string; priority?: string },
  token?: string
): Promise<ApiResponse<GovernmentActionRecord>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/actions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(action),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to record government action: ${res.status}`);
  }
  return res.json();
}

export async function getGovernmentAlerts(token?: string, includeDemo = false): Promise<ApiResponse<GovernmentAlert[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/alerts?includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch alerts: ${res.status}`);
  }
  return res.json();
}

export async function getEcosystemGaps(token?: string): Promise<ApiResponse<EcosystemGap[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/ecosystem-gaps`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch ecosystem gaps: ${res.status}`);
  }
  return res.json();
}

export async function getGovernmentHiddenGems(token?: string, limit = 15, includeDemo = false): Promise<ApiResponse<DynamicHiddenGem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/hidden-gems?limit=${limit}&includeDemo=${includeDemo}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch hidden gems: ${res.status}`);
  }
  return res.json();
}

export async function getDynamicRedistributionCorridors(sourceId?: string, token?: string, limit = 15, includeDemo = false): Promise<ApiResponse<DynamicRedistributionPair[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = sourceId
    ? `${API_BASE_URL}/government/intelligence/redistribution/dynamic?sourceId=${encodeURIComponent(sourceId)}&limit=${limit}&includeDemo=${includeDemo}`
    : `${API_BASE_URL}/government/intelligence/redistribution/dynamic?limit=${limit}&includeDemo=${includeDemo}`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch dynamic corridors: ${res.status}`);
  }
  return res.json();
}

export async function getActionHistory(status?: string, priority?: string, token?: string): Promise<ApiResponse<GovernmentActionRecord[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);

  const url = `${API_BASE_URL}/government/intelligence/actions/history${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch action history: ${res.status}`);
  }
  return res.json();
}

export async function updateActionStatus(id: string, status: string, resolutionNotes?: string, token?: string): Promise<ApiResponse<GovernmentActionRecord>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/intelligence/actions/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, resolutionNotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update action status: ${res.status}`);
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

export async function getDestinationFood(destinationId: string): Promise<ApiResponse<FamousFoodItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/food`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination food: ${res.status}`);
  return res.json();
}

export async function getDestinationRestaurants(destinationId: string): Promise<ApiResponse<RestaurantItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/restaurants`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination restaurants: ${res.status}`);
  return res.json();
}

export async function getDestinationTransport(destinationId: string): Promise<ApiResponse<DestinationTransportItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/transport`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination transport: ${res.status}`);
  return res.json();
}

export async function getDestinationAgencies(destinationId: string): Promise<ApiResponse<TravelAgencyItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/agencies`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination travel agencies: ${res.status}`);
  return res.json();
}

export async function getDestinationRentals(destinationId: string): Promise<ApiResponse<RentalProviderItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/rentals`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination rentals: ${res.status}`);
  return res.json();
}

export async function getDestinationEcosystem(destinationId: string): Promise<ApiResponse<DestinationEcosystem>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/ecosystem`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination ecosystem: ${res.status}`);
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

// =========================================================================
// YatraSetu Local / Local Hosts
// =========================================================================

export async function getLocalHosts(params?: {
  cityId?: string;
  destinationId?: string;
  stateId?: string;
  isVerified?: boolean;
  minRating?: number;
  maxPrice?: number;
  skill?: string;
  language?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
}): Promise<ApiResponse<PageResponse<LocalHost>>> {
  const query = new URLSearchParams();
  if (params?.cityId && params.cityId !== 'all') query.set('cityId', params.cityId);
  if (params?.destinationId && params.destinationId !== 'all') query.set('destinationId', params.destinationId);
  if (params?.stateId && params.stateId !== 'all') query.set('stateId', params.stateId);
  if (params?.isVerified !== undefined) query.set('isVerified', params.isVerified.toString());
  if (params?.minRating) query.set('minRating', params.minRating.toString());
  if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
  if (params?.skill && params.skill !== 'all') query.set('skill', params.skill);
  if (params?.language && params.language !== 'all') query.set('language', params.language);
  if (params?.search) query.set('search', params.search);
  if (params?.page !== undefined) query.set('page', params.page.toString());
  if (params?.size !== undefined) query.set('size', params.size.toString());
  if (params?.sort) query.set('sort', params.sort);
  if (params?.direction) query.set('direction', params.direction);

  const res = await fetch(`${API_BASE_URL}/local?${query.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch local hosts: ${res.status}`);
  return res.json();
}

export async function getLocalHostById(id: string): Promise<ApiResponse<LocalHostDetail>> {
  const res = await fetch(`${API_BASE_URL}/local/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Local host not found');
    throw new Error(`Failed to fetch local host: ${res.status}`);
  }
  return res.json();
}

export async function getDestinationHosts(destinationId: string): Promise<ApiResponse<LocalHost[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/hosts`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination hosts: ${res.status}`);
  return res.json();
}

// =========================================================================
// Experiences
// =========================================================================

export async function getExperiences(params?: {
  destinationId?: string;
  cityId?: string;
  category?: string;
  maxPrice?: number;
  language?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
}): Promise<ApiResponse<PageResponse<ExperienceItem>>> {
  const query = new URLSearchParams();
  if (params?.destinationId && params.destinationId !== 'all') query.set('destinationId', params.destinationId);
  if (params?.cityId && params.cityId !== 'all') query.set('cityId', params.cityId);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
  if (params?.language && params.language !== 'all') query.set('language', params.language);
  if (params?.search) query.set('search', params.search);
  if (params?.page !== undefined) query.set('page', params.page.toString());
  if (params?.size !== undefined) query.set('size', params.size.toString());
  if (params?.sort) query.set('sort', params.sort);
  if (params?.direction) query.set('direction', params.direction);

  const res = await fetch(`${API_BASE_URL}/experiences?${query.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch experiences: ${res.status}`);
  return res.json();
}

export async function getExperienceById(id: string): Promise<ApiResponse<ExperienceItem>> {
  const res = await fetch(`${API_BASE_URL}/experiences/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Experience not found');
    throw new Error(`Failed to fetch experience: ${res.status}`);
  }
  return res.json();
}

export async function getDestinationExperiences(destinationId: string): Promise<ApiResponse<ExperienceItem[]>> {
  const res = await fetch(`${API_BASE_URL}/destinations/${encodeURIComponent(destinationId)}/experiences`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch destination experiences: ${res.status}`);
  return res.json();
}

export async function getExperienceCategories(): Promise<ApiResponse<string[]>> {
  const res = await fetch(`${API_BASE_URL}/experiences/categories`, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error(`Failed to fetch experience categories: ${res.status}`);
  return res.json();
}

// =========================================================================
// Hotels
// =========================================================================

export async function getHotels(params?: {
  cityId?: string;
  destinationId?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  isPartnerProperty?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
}): Promise<ApiResponse<PageResponse<HotelItem>>> {
  const query = new URLSearchParams();
  if (params?.cityId && params.cityId !== 'all') query.set('cityId', params.cityId);
  if (params?.destinationId && params.destinationId !== 'all') query.set('destinationId', params.destinationId);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.minRating) query.set('minRating', params.minRating.toString());
  if (params?.maxPrice) query.set('maxPrice', params.maxPrice.toString());
  if (params?.isPartnerProperty !== undefined) query.set('isPartnerProperty', params.isPartnerProperty.toString());
  if (params?.search) query.set('search', params.search);
  if (params?.page !== undefined) query.set('page', params.page.toString());
  if (params?.size !== undefined) query.set('size', params.size.toString());
  if (params?.sort) query.set('sort', params.sort);
  if (params?.direction) query.set('direction', params.direction);

  const res = await fetch(`${API_BASE_URL}/hotels?${query.toString()}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch hotels: ${res.status}`);
  return res.json();
}

export async function getHotelById(id: string): Promise<ApiResponse<HotelItem>> {
  const res = await fetch(`${API_BASE_URL}/hotels/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Hotel not found');
    throw new Error(`Failed to fetch hotel: ${res.status}`);
  }
  return res.json();
}

export async function getHotelCategories(): Promise<ApiResponse<string[]>> {
  const res = await fetch(`${API_BASE_URL}/hotels/categories`, { next: { revalidate: 120 } });
  if (!res.ok) throw new Error(`Failed to fetch hotel categories: ${res.status}`);
  return res.json();
}

// =========================================================================
// Partner Experience Management (Protected)
// =========================================================================

export async function getPartnerExperiences(token?: string): Promise<ApiResponse<ExperienceItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/experiences`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch partner experiences: ${res.status}`);
  }
  return res.json();
}

export async function createPartnerExperience(
  data: Partial<ExperienceItem>,
  token?: string
): Promise<ApiResponse<ExperienceItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/experiences`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create experience: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerExperience(
  id: string,
  data: Partial<ExperienceItem>,
  token?: string
): Promise<ApiResponse<ExperienceItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/experiences/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update experience: ${res.status}`);
  }
  return res.json();
}

export async function deletePartnerExperience(
  id: string,
  token?: string
): Promise<ApiResponse<void>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/experiences/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete experience: ${res.status}`);
  }
  return res.json();
}

export async function submitPartnerExperienceForReview(
  id: string,
  token?: string
): Promise<ApiResponse<ExperienceItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/experiences/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to submit experience for review: ${res.status}`);
  }
  return res.json();
}

export async function getPendingGovernmentExperiences(
  token?: string
): Promise<ApiResponse<ExperienceItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/experiences/pending`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch pending experiences: ${res.status}`);
  }
  return res.json();
}

export async function reviewGovernmentExperience(
  id: string,
  decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  verificationNotes?: string,
  token?: string
): Promise<ApiResponse<ExperienceItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/experiences/${encodeURIComponent(id)}/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ decision, verificationNotes }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to review experience: ${res.status}`);
  }
  return res.json();
}

// =========================================================================
// Travel Connect
// =========================================================================

export interface TravelerDiscovery {
  id: string;
  userId: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
  destinationId?: string;
  destinationName?: string;
  destinationCity: string;
  stateId?: string;
  travelDate: string;
  endDate?: string;
  flexibleDates?: boolean;
  travelStyle: string;
  groupSize?: number;
  budgetInr?: number;
  interests: string[];
  languages: string[];
  notes?: string;
  isDemoData?: boolean;
  connectionStatus?: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  existingRequestId?: string;
  matchScore: number;
  matchReasons: string[];
}

export interface UpcomingTrip {
  id: string;
  destinationId?: string;
  destinationName?: string;
  destinationCity: string;
  travelDate: string;
  endDate?: string;
  flexibleDates?: boolean;
  travelStyle: string;
  groupSize?: number;
  interests: string[];
  notes?: string;
}

export interface TravelerProfile {
  id: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
  travelStyle?: string;
  interests: string[];
  languages: string[];
  travelConnectEnabled?: boolean;
  isDemoData?: boolean;
  upcomingTrips: UpcomingTrip[];
  connectionStatus?: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  existingRequestId?: string;
}

export interface ConnectionRequestItem {
  id: string;
  senderId: string;
  senderName: string;
  senderImageUrl?: string;
  receiverId: string;
  receiverName: string;
  receiverImageUrl?: string;
  destinationId?: string;
  destinationName?: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionItem {
  requestId: string;
  connectedUserId: string;
  connectedUserName: string;
  connectedUserImageUrl?: string;
  connectedUserBio?: string;
  destinationId?: string;
  destinationName?: string;
  connectedSince: string;
}

export interface ChatMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderImageUrl?: string;
  receiverId: string;
  messageText: string;
  createdAt: string;
  isRead: boolean;
}

export interface TravelConnectSettings {
  travelConnectEnabled: boolean;
}

export async function discoverTravelers(
  params?: {
    destinationId?: string;
    city?: string;
    travelStyle?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  },
  token?: string
): Promise<ApiResponse<PageResponse<TravelerDiscovery>>> {
  const query = new URLSearchParams();
  if (params?.destinationId && params.destinationId !== 'all') query.set('destinationId', params.destinationId);
  if (params?.city) query.set('city', params.city);
  if (params?.travelStyle && params.travelStyle !== 'all') query.set('travelStyle', params.travelStyle);
  if (params?.fromDate) query.set('fromDate', params.fromDate);
  if (params?.toDate) query.set('toDate', params.toDate);
  if (params?.page !== undefined) query.set('page', params.page.toString());
  if (params?.size !== undefined) query.set('size', params.size.toString());

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect?${query.toString()}`, {
    headers,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Failed to discover travelers: ${res.status}`);
  return res.json();
}

export async function getDestinationTravelers(
  destinationId: string,
  limit?: number,
  token?: string
): Promise<ApiResponse<TravelerDiscovery[]>> {
  const query = limit ? `?limit=${limit}` : '';
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/destination/${encodeURIComponent(destinationId)}${query}`, {
    headers,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Failed to fetch destination travelers: ${res.status}`);
  return res.json();
}

export async function getTravelerProfile(
  travelerId: string,
  token?: string
): Promise<ApiResponse<TravelerProfile>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/${encodeURIComponent(travelerId)}`, {
    headers,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Failed to fetch traveler profile: ${res.status}`);
  return res.json();
}

export async function sendConnectionRequest(
  data: { receiverId: string; destinationId?: string; message?: string },
  token?: string
): Promise<ApiResponse<ConnectionRequestItem>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/requests`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to send request: ${res.status}`);
  }
  return res.json();
}

export async function getReceivedRequests(token?: string): Promise<ApiResponse<ConnectionRequestItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/requests/received`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch received requests: ${res.status}`);
  return res.json();
}

export async function getSentRequests(token?: string): Promise<ApiResponse<ConnectionRequestItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/requests/sent`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch sent requests: ${res.status}`);
  return res.json();
}

export async function acceptConnectionRequest(id: string, token?: string): Promise<ApiResponse<ConnectionRequestItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/requests/${encodeURIComponent(id)}/accept`, {
    method: 'PUT',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to accept request: ${res.status}`);
  }
  return res.json();
}

export async function rejectConnectionRequest(id: string, token?: string): Promise<ApiResponse<ConnectionRequestItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/requests/${encodeURIComponent(id)}/reject`, {
    method: 'PUT',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to reject request: ${res.status}`);
  }
  return res.json();
}

export async function cancelConnectionRequest(id: string, token?: string): Promise<ApiResponse<ConnectionRequestItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/requests/${encodeURIComponent(id)}/cancel`, {
    method: 'PUT',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to cancel request: ${res.status}`);
  }
  return res.json();
}

export async function blockUser(userId: string, token?: string): Promise<ApiResponse<void>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/users/${encodeURIComponent(userId)}/block`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to block user: ${res.status}`);
  }
  return res.json();
}

export async function getConnections(token?: string): Promise<ApiResponse<ConnectionItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/connections`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch connections: ${res.status}`);
  return res.json();
}

export async function getConnectionMessages(connectionId: string, token?: string): Promise<ApiResponse<ChatMessageItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/connections/${encodeURIComponent(connectionId)}/messages`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
  return res.json();
}

export async function sendConnectionMessage(
  connectionId: string,
  messageText: string,
  token?: string
): Promise<ApiResponse<ChatMessageItem>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/connections/${encodeURIComponent(connectionId)}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messageText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to send message: ${res.status}`);
  }
  return res.json();
}

export async function getTravelConnectSettings(token?: string): Promise<ApiResponse<TravelConnectSettings>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/settings`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);
  return res.json();
}

export async function updateTravelConnectSettings(
  enabled: boolean,
  token?: string
): Promise<ApiResponse<TravelConnectSettings>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/travel-connect/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ travelConnectEnabled: enabled }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update settings: ${res.status}`);
  }
  return res.json();
}

// ==============================================================================
// PHASE 7: AI Travel Assistant & Smart Trip Planner
// ==============================================================================

export interface AiPageContext {
  path?: string;
  destinationId?: string;
  cityId?: string;
  destinationName?: string;
  filters?: Record<string, unknown>;
}

export interface AiChatRequest {
  message: string;
  conversationId?: string;
  pageContext?: AiPageContext;
}

export interface AiEntityReference {
  type: 'DESTINATION' | 'POI' | 'FOOD' | 'HOTEL' | 'EXPERIENCE' | 'HOST';
  id: string;
  name: string;
  url: string;
  subtitle?: string;
}

export interface AiChatResponse {
  message: string;
  conversationId: string;
  role: 'GUEST' | 'TRAVELER' | 'PARTNER' | 'GOVERNMENT';
  suggestedActions: string[];
  relevantEntities: AiEntityReference[];
  fallback: boolean;
  provider: string;
  disclaimer: string;
}

export interface SuggestedQuestionsResponse {
  role: string;
  destinationId?: string;
  destinationName?: string;
  questions: string[];
}

export interface TripPlanRequest {
  destinationId: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  travelerCount?: number;
  budgetTier?: 'Budget' | 'Mid-Range' | 'Luxury';
  travelStyle?: string;
  companions?: string;
  interests?: string[];
  saveDirectly?: boolean;
}

export interface ItineraryItemDto {
  id?: string;
  itemType: string;
  itemId?: string;
  poiId?: string;
  title: string;
  timeSlot?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  durationHours?: number;
  estimatedCostInr?: number;
  priceTransparency?: 'KNOWN' | 'ESTIMATED' | 'UNAVAILABLE';
  rationale?: string;
  orderIndex: number;
  imageUrl?: string;
  category?: string;
  source?: string;
}

export interface ItineraryDayDto {
  id?: string;
  dayNumber: number;
  theme?: string;
  notes?: string;
  items: ItineraryItemDto[];
}

export interface BudgetItemBreakdown {
  category: string;
  amountInr: number;
  priceType: 'KNOWN' | 'ESTIMATED' | 'UNAVAILABLE';
  description?: string;
}

export interface BudgetBreakdownDto {
  knownCostsInr: number;
  estimatedCostsInr: number;
  totalBudgetInr: number;
  unavailablePriceItems: string[];
  items: BudgetItemBreakdown[];
  currency: string;
  honestyNote?: string;
}

export interface WeatherSummaryDto {
  temperatureC?: number;
  condition?: string;
  source?: string;
  advice?: string;
}

export interface TripDto {
  id?: string;
  destinationId: string;
  destinationName: string;
  destinationImage?: string;
  cityName?: string;
  stateName?: string;
  title: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  travelerCount: number;
  budgetCategory: string;
  totalBudgetInr: number;
  status?: string;
  isAiGenerated?: boolean;
  createdAt?: string;
  itineraries: ItineraryDayDto[];
  budgetBreakdown?: BudgetBreakdownDto;
  weatherSummary?: WeatherSummaryDto;
}

export async function sendAiChat(
  request: AiChatRequest,
  token?: string
): Promise<ApiResponse<AiChatResponse>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `AI chat failed: ${res.status}`);
  }
  return res.json();
}

export async function getSuggestedQuestions(
  destinationId?: string,
  path?: string,
  token?: string
): Promise<ApiResponse<SuggestedQuestionsResponse>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const params = new URLSearchParams();
  if (destinationId) params.append('destinationId', destinationId);
  if (path) params.append('path', path);

  const url = `${API_BASE_URL}/ai/suggested-questions${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch suggested questions: ${res.status}`);
  return res.json();
}

export async function planTrip(
  request: TripPlanRequest,
  token?: string
): Promise<ApiResponse<TripDto>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/ai/plan-trip`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Trip planning failed: ${res.status}`);
  }
  return res.json();
}

export async function saveTrip(
  trip: TripDto,
  token?: string
): Promise<ApiResponse<TripDto>> {
  if (!token) {
    throw new Error('Authentication required to save trip');
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers,
    body: JSON.stringify(trip),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to save trip: ${res.status}`);
  }
  return res.json();
}

export async function getMyTrips(token?: string): Promise<ApiResponse<TripDto[]>> {
  if (!token) {
    throw new Error('Authentication required to view trips');
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/trips`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch trips: ${res.status}`);
  }
  return res.json();
}

export async function getTripById(id: string, token?: string): Promise<ApiResponse<TripDto>> {
  if (!token) {
    throw new Error('Authentication required to view trip');
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/trips/${encodeURIComponent(id)}`, { headers, cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch trip: ${res.status}`);
  }
  return res.json();
}

export async function deleteTrip(id: string, token?: string): Promise<ApiResponse<void>> {
  if (!token) {
    throw new Error('Authentication required to delete trip');
  }
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/trips/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete trip: ${res.status}`);
  }
  return res.json();
}

// ==========================================
// Cultural Traditions & Heritage Craft APIs
// ==========================================

export interface CulturalTraditionDto {
  id: string;
  stateId: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  destinationId?: string;
  destinationName?: string;
  traditionName: string;
  category: string;
  craftType?: string;
  historicalOrigin?: string;
  materialsUsed?: string;
  culturalSignificance?: string;
  isGiTagged?: boolean;
  giTagYear?: string;
  primaryProducingCluster?: string;
  sourceOrganization?: string;
  sourceType?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  imageUrl?: string;
  provenance?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCulturalTraditionsParams {
  stateId?: string;
  cityId?: string;
  destinationId?: string;
  category?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export async function getCulturalTraditions(
  params: GetCulturalTraditionsParams = {}
): Promise<ApiResponse<PageResponse<CulturalTraditionDto>>> {
  const query = new URLSearchParams();
  if (params.stateId && params.stateId !== 'All') query.set('stateId', params.stateId);
  if (params.cityId && params.cityId !== 'All') query.set('cityId', params.cityId);
  if (params.destinationId && params.destinationId !== 'All') query.set('destinationId', params.destinationId);
  if (params.category && params.category !== 'All') query.set('category', params.category);
  if (params.search && params.search.trim()) query.set('search', params.search.trim());
  if (params.page !== undefined) query.set('page', params.page.toString());
  if (params.size !== undefined) query.set('size', params.size.toString());
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortDir) query.set('sortDir', params.sortDir);

  const url = `${API_BASE_URL}/culture/traditions${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural traditions: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalTraditionDetail(
  id: string
): Promise<ApiResponse<CulturalTraditionDto>> {
  const res = await fetch(`${API_BASE_URL}/culture/traditions/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural tradition detail: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalCategories(): Promise<ApiResponse<string[]>> {
  const res = await fetch(`${API_BASE_URL}/culture/categories`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural categories: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalTraditionsByState(
  stateId: string
): Promise<ApiResponse<CulturalTraditionDto[]>> {
  const res = await fetch(`${API_BASE_URL}/culture/states/${encodeURIComponent(stateId)}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural traditions for state: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalTraditionsByDestination(
  destinationId: string
): Promise<ApiResponse<CulturalTraditionDto[]>> {
  const res = await fetch(`${API_BASE_URL}/culture/destinations/${encodeURIComponent(destinationId)}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural traditions for destination: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalTraditionExperiences(
  id: string
): Promise<ApiResponse<ExperienceItem[]>> {
  const res = await fetch(`${API_BASE_URL}/culture/traditions/${encodeURIComponent(id)}/experiences`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch experiences for cultural tradition: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Phase 21.5 — Cultural Opportunity Score & Intelligence APIs
// ---------------------------------------------------------------------------

export interface CulturalOpportunityItem {
  destinationId: string;
  destinationName: string;
  cityId?: string;
  cityName?: string;
  stateId?: string;
  stateName?: string;
  score: number | null;
  status: 'SUFFICIENT_DATA' | 'INSUFFICIENT_DATA';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  classification: 'HIGH_OPPORTUNITY' | 'MODERATE_OPPORTUNITY' | 'EMERGING_OPPORTUNITY' | 'LOWER_OPPORTUNITY' | 'INSUFFICIENT_DATA';
  matrixCategory: 'HIGH_DEMAND_LOW_SUPPLY' | 'HIGH_DEMAND_HIGH_SUPPLY' | 'LOW_DEMAND_LOW_SUPPLY' | 'LOW_DEMAND_HIGH_SUPPLY' | 'INSUFFICIENT_DATA';
  traditionScore: number;
  demandScore: number;
  supplyScore: number;
  gapPenalty: number;
  traditionCount: number;
  destinationTraditionCount: number;
  cityTraditionCount: number;
  stateTraditionCount: number;
  giTraditionCount: number;
  observedDemandSignals: number;
  verifiedExperienceCount: number;
  verifiedArtisanCount: number;
  detectedGaps: string[];
  explanations: string[];
  suggestedActions: string[];
  dataMode: 'OBSERVED' | 'DEMO';
  disclaimer: string;
  generatedAt: string;
}

export interface CulturalOpportunityOverview {
  totalDestinationsEvaluated: number;
  destinationsWithSufficientData: number;
  destinationsWithInsufficientData: number;
  averageOpportunityScore: number;
  highOpportunityCount: number;
  moderateOpportunityCount: number;
  emergingOpportunityCount: number;
  lowerOpportunityCount: number;
  culturalExperienceDeficitCount: number;
  giRichDestinationsCount: number;
  matrixDistribution: Record<string, number>;
  topOpportunityDestinations: CulturalOpportunityItem[];
  isDemoModeActive: boolean;
  observedSignalsCount: number;
  demoSignalsCount: number;
  dataProvenance: Record<string, string>;
  dataDisclaimer: string;
  generatedAt: string;
}

export async function getCulturalOpportunities(
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalOpportunityItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-opportunities?includeDemo=${includeDemo}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural opportunities: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalOpportunityOverview(
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalOpportunityOverview>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-opportunities/overview?includeDemo=${includeDemo}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural opportunity overview: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalOpportunityDetail(
  destinationId: string,
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalOpportunityItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-opportunities/${encodeURIComponent(destinationId)}?includeDemo=${includeDemo}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural opportunity detail: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Phase 21.6 — Cultural Ecosystem Gap & Government Action Engine APIs
// ---------------------------------------------------------------------------

export interface CulturalEcosystemGapItem {
  id: string;
  destinationId: string;
  destinationName: string;
  cityId?: string;
  cityName?: string;
  stateId?: string;
  stateName?: string;
  gapType: 'CULTURAL_EXPERIENCE_DEFICIT' | 'ARTISAN_PARTNER_DEFICIT' | 'CONNECTIVITY_GAP' | 'STAYS_DEFICIT' | 'GUIDE_HOST_DEFICIT' | 'CULTURAL_DATA_GAP';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';
  opportunityScore: number | null;
  traditionScore: number;
  demandScore: number;
  supplyScore: number;
  traditionCount: number;
  giTraditionCount: number;
  observedDemandSignals: number;
  verifiedExperienceCount: number;
  verifiedArtisanCount: number;
  recommendedAction: string;
  evidence: string;
  honestyDisclaimer: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  dataMode: 'OBSERVED' | 'DEMO';
  detectedAt: string;
}

export interface CulturalEcosystemGapOverview {
  totalGapsDetected: number;
  criticalGapsCount: number;
  highSeverityGapsCount: number;
  mediumSeverityGapsCount: number;
  lowSeverityGapsCount: number;
  experienceDeficitCount: number;
  artisanDeficitCount: number;
  connectivityGapCount: number;
  staysDeficitCount: number;
  guideHostDeficitCount: number;
  culturalDataGapCount: number;
  totalDestinationsWithGaps: number;
  isDemoModeActive: boolean;
  gapsByType: Record<string, number>;
  gapsBySeverity: Record<string, number>;
  dataDisclaimer: string;
  generatedAt: string;
}

export interface CulturalGovernmentActionItem {
  id: string;
  destinationId: string;
  destinationName: string;
  stateId?: string;
  stateName?: string;
  cityName?: string;
  actionType: string;
  title: string;
  description: string;
  gapType: 'CULTURAL_EXPERIENCE_DEFICIT' | 'ARTISAN_PARTNER_DEFICIT' | 'CONNECTIVITY_GAP' | 'STAYS_DEFICIT' | 'GUIDE_HOST_DEFICIT' | 'CULTURAL_DATA_GAP';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  opportunityScore: number | null;
  severity: string;
  recommendedAction: string;
  actionReason: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  assignedTo?: string;
  updatedBy?: string;
  evidenceSummary: string;
  honestyDisclaimer: string;
  dataMode: 'OBSERVED' | 'DEMO';
  createdAt: string;
  updatedAt: string;
}

export async function getCulturalGaps(
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalEcosystemGapItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions/gaps?includeDemo=${includeDemo}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural gaps: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalGapsOverview(
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalEcosystemGapOverview>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions/gaps/overview?includeDemo=${includeDemo}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural gaps overview: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalGapsForDestination(
  destinationId: string,
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalEcosystemGapItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions/gaps/destination/${encodeURIComponent(destinationId)}?includeDemo=${includeDemo}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural gaps for destination: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalActions(
  token?: string,
  includeDemo = false,
  status?: string,
  priority?: string,
  gapType?: string
): Promise<ApiResponse<CulturalGovernmentActionItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const query = new URLSearchParams();
  query.set('includeDemo', includeDemo.toString());
  if (status && status !== 'ALL') query.set('status', status);
  if (priority && priority !== 'ALL') query.set('priority', priority);
  if (gapType && gapType !== 'ALL') query.set('gapType', gapType);

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions?${query.toString()}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural actions: ${res.status}`);
  }
  return res.json();
}

export async function getCulturalActionById(
  actionId: string,
  token?: string
): Promise<ApiResponse<CulturalGovernmentActionItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions/${encodeURIComponent(actionId)}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cultural action: ${res.status}`);
  }
  return res.json();
}

export async function generateCulturalActions(
  token?: string,
  includeDemo = false
): Promise<ApiResponse<CulturalGovernmentActionItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions/generate?includeDemo=${includeDemo}`, {
    method: 'POST',
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to generate cultural actions: ${res.status}`);
  }
  return res.json();
}

export async function updateCulturalActionStatus(
  actionId: string,
  status: string,
  resolutionNotes?: string,
  token?: string
): Promise<ApiResponse<CulturalGovernmentActionItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/cultural-actions/${encodeURIComponent(actionId)}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, resolutionNotes }),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to update cultural action status: ${res.status}`);
  }
  return res.json();
}

// ==========================================
// HOTEL PARTNER ONBOARDING & VERIFICATION APIS
// ==========================================

export async function getMyPartnerHotels(token?: string): Promise<ApiResponse<HotelItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch partner hotels: ${res.status}`);
  }
  return res.json();
}

export async function getMyPartnerHotelById(id: string, token?: string): Promise<ApiResponse<HotelItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(id)}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch partner hotel: ${res.status}`);
  }
  return res.json();
}

export async function createPartnerHotel(data: CreateHotelRequest, token?: string): Promise<ApiResponse<HotelItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to create hotel property: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerHotel(id: string, data: UpdateHotelRequest, token?: string): Promise<ApiResponse<HotelItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to update hotel property: ${res.status}`);
  }
  return res.json();
}

export async function submitPartnerHotel(id: string, token?: string): Promise<ApiResponse<HotelItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to submit hotel for verification: ${res.status}`);
  }
  return res.json();
}

export async function deletePartnerHotel(id: string, token?: string): Promise<ApiResponse<void>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete hotel: ${res.status}`);
  }
  return res.json();
}

export async function getPendingGovernmentHotels(token?: string): Promise<ApiResponse<HotelItem[]>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/hotels/pending`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pending hotel verifications: ${res.status}`);
  }
  return res.json();
}

export async function getGovernmentHotelById(id: string, token?: string): Promise<ApiResponse<HotelItem>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/hotels/${encodeURIComponent(id)}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch hotel for verification review: ${res.status}`);
  }
  return res.json();
}

export async function reviewGovernmentHotel(
  id: string,
  data: HotelVerificationRequest,
  token?: string
): Promise<ApiResponse<HotelItem>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/government/hotels/${encodeURIComponent(id)}/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Failed to review hotel verification: ${res.status}`);
  }
  return res.json();
}

// ----------------------------------------------------
// PHASE 22.3: HOTEL ROOM TYPES & INVENTORY API CLIENT
// ----------------------------------------------------

export async function getPublicHotelRooms(hotelId: string): Promise<ApiResponse<HotelRoomTypeItem[]>> {
  const res = await fetch(`${API_BASE_URL}/hotels/${encodeURIComponent(hotelId)}/rooms`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch hotel room types: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerHotelRooms(hotelId: string, token: string): Promise<ApiResponse<HotelRoomTypeItem[]>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch partner room types: ${res.status}`);
  }
  return res.json();
}

export async function createPartnerHotelRoom(
  hotelId: string,
  data: CreateRoomTypeRequest,
  token: string
): Promise<ApiResponse<HotelRoomTypeItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create room type: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerHotelRoom(
  hotelId: string,
  roomId: string,
  data: UpdateRoomTypeRequest,
  token: string
): Promise<ApiResponse<HotelRoomTypeItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update room type: ${res.status}`);
  }
  return res.json();
}

export async function deletePartnerHotelRoom(
  hotelId: string,
  roomId: string,
  token: string
): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete room type: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerRoomInventory(
  hotelId: string,
  roomId: string,
  token: string
): Promise<ApiResponse<HotelInventoryItem[]>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/inventory`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch room inventory: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerRoomInventory(
  hotelId: string,
  roomId: string,
  data: UpdateInventoryRequest,
  token: string
): Promise<ApiResponse<HotelInventoryItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update room inventory: ${res.status}`);
  }
  return res.json();
}

// ----------------------------------------------------------------------------
// PHASE 22.4 — HOTEL RATE PLANS & PRICING API
// ----------------------------------------------------------------------------

export async function getPublicHotelRatePlans(
  hotelId: string
): Promise<ApiResponse<HotelRatePlanItem[]>> {
  const res = await fetch(`${API_BASE_URL}/hotels/${encodeURIComponent(hotelId)}/rate-plans`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch hotel rate plans: ${res.status}`);
  }
  return res.json();
}

export async function getPublicRoomRatePlans(
  hotelId: string,
  roomId: string
): Promise<ApiResponse<HotelRatePlanItem[]>> {
  const res = await fetch(`${API_BASE_URL}/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch room rate plans: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerRatePlans(
  hotelId: string,
  roomId: string,
  token: string
): Promise<ApiResponse<HotelRatePlanItem[]>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch partner rate plans: ${res.status}`);
  }
  return res.json();
}

export async function createPartnerRatePlan(
  hotelId: string,
  roomId: string,
  data: CreateRatePlanRequest,
  token: string
): Promise<ApiResponse<HotelRatePlanItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create rate plan: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerRatePlan(
  hotelId: string,
  roomId: string,
  ratePlanId: string,
  data: UpdateRatePlanRequest,
  token: string
): Promise<ApiResponse<HotelRatePlanItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans/${encodeURIComponent(ratePlanId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update rate plan: ${res.status}`);
  }
  return res.json();
}

export async function activatePartnerRatePlan(
  hotelId: string,
  roomId: string,
  ratePlanId: string,
  token: string
): Promise<ApiResponse<HotelRatePlanItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans/${encodeURIComponent(ratePlanId)}/activate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to activate rate plan: ${res.status}`);
  }
  return res.json();
}

export async function deactivatePartnerRatePlan(
  hotelId: string,
  roomId: string,
  ratePlanId: string,
  token: string
): Promise<ApiResponse<HotelRatePlanItem>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans/${encodeURIComponent(ratePlanId)}/deactivate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to deactivate rate plan: ${res.status}`);
  }
  return res.json();
}

export async function deletePartnerRatePlan(
  hotelId: string,
  roomId: string,
  ratePlanId: string,
  token: string
): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/rate-plans/${encodeURIComponent(ratePlanId)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete rate plan: ${res.status}`);
  }
  return res.json();
}

// ----------------------------------------------------------------------------
// PHASE 22.5 — DATE-SPECIFIC REAL HOTEL AVAILABILITY ENGINE API
// ----------------------------------------------------------------------------

export type HotelAvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | 'UNAVAILABLE_DATA';

export interface BulkInventoryUpdateRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalUnits: number;
  blockedUnits?: number;
}

export interface NightlyAvailabilityDto {
  date: string;
  totalUnits: number;
  blockedUnits: number;
  reservedUnits: number;
  availableUnits: number;
  status: HotelAvailabilityStatus;
  isDateOverride: boolean;
}

export interface RoomTypeAvailabilityDto {
  roomTypeId: string;
  roomTypeName: string;
  maxOccupancy: number;
  totalUnits: number;
  blockedUnits: number;
  reservedUnits: number;
  availableUnits: number;
  status: HotelAvailabilityStatus;
  isAvailable: boolean;
  nightly: NightlyAvailabilityDto[];
  ratePlans: HotelRatePlanItem[];
}

export interface HotelAvailabilityDto {
  hotelId: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests?: number;
  status: HotelAvailabilityStatus;
  isLiveAvailability: boolean;
  provenance: string;
  note: string;
  rooms: RoomTypeAvailabilityDto[];
}

export async function getHotelAvailability(
  hotelId: string,
  params: {
    checkIn: string;
    checkOut: string;
    roomTypeId?: string;
    guests?: number;
  }
): Promise<ApiResponse<HotelAvailabilityDto>> {
  const query = new URLSearchParams();
  query.set('checkIn', params.checkIn);
  query.set('checkOut', params.checkOut);
  if (params.roomTypeId) query.set('roomTypeId', params.roomTypeId);
  if (params.guests) query.set('guests', params.guests.toString());

  const res = await fetch(`${API_BASE_URL}/hotels/${encodeURIComponent(hotelId)}/availability?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch availability: ${res.status}`);
  }
  return res.json();
}

export async function updatePartnerBulkRoomInventory(
  hotelId: string,
  roomId: string,
  data: BulkInventoryUpdateRequest,
  token: string
): Promise<ApiResponse<HotelInventoryItem[]>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/inventory/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to bulk update room inventory: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerHotelInventoryCalendar(
  hotelId: string,
  roomId: string,
  startDate?: string,
  endDate?: string,
  token?: string
): Promise<ApiResponse<HotelInventoryCalendarDto[]>> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/inventory/calendar${query}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch inventory calendar: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerHotelAnalytics(
  hotelId: string,
  token?: string
): Promise<ApiResponse<PartnerHotelAnalyticsDto>> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/analytics`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch partner hotel analytics: ${res.status}`);
  }
  return res.json();
}

export type HotelBookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type HotelPaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface HotelBookingAllocationDto {
  id: string;
  allocationDate: string;
  allocatedUnits: number;
  status: string;
}

export interface BookingStatusHistoryDto {
  id: string;
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  actorUserId?: string;
  createdAt: string;
}

export interface HotelBookingDto {
  id: string;
  bookingReference: string;
  travelerId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  hotelId: string;
  hotelName: string;
  hotelCity?: string;
  hotelState?: string;
  hotelAddress?: string;
  roomTypeId: string;
  roomTypeName: string;
  ratePlanId: string;
  ratePlanName: string;
  mealPlan?: string;
  checkIn: string;
  checkOut: string;
  numberOfRooms: number;
  numberOfNights: number;
  adults: number;
  children?: number;
  currency: string;
  pricePerNight: number;
  subtotal: number;
  taxesAmount: number;
  feesAmount: number;
  totalAmount: number;
  pricingDisclosure: string;
  bookingStatus: HotelBookingStatus;
  paymentStatus: HotelPaymentStatus;
  sourceType: string;
  idempotencyKey?: string;
  expiresAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationReasonCode?: string;
  cancellationPolicySnapshot?: string;
  cancellationDeadlineHours?: number;
  createdAt: string;
  updatedAt: string;
  allocations?: HotelBookingAllocationDto[];
  statusHistory?: BookingStatusHistoryDto[];
}

export interface CreateHotelBookingRequest {
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  numberOfRooms: number;
  adults: number;
  children?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  idempotencyKey?: string;
}

export interface CancelHotelBookingRequest {
  reason?: string;
  reasonCode?: string;
}

export async function createHotelBooking(
  hotelId: string,
  data: CreateHotelBookingRequest,
  token: string
): Promise<ApiResponse<HotelBookingDto>> {
  const res = await fetch(`${API_BASE_URL}/hotels/${encodeURIComponent(hotelId)}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create booking: ${res.status}`);
  }
  return res.json();
}

export async function getMyHotelBookings(
  token: string
): Promise<ApiResponse<HotelBookingDto[]>> {
  const res = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch bookings: ${res.status}`);
  }
  return res.json();
}

export async function getHotelBookingByReference(
  bookingReference: string,
  token: string
): Promise<ApiResponse<HotelBookingDto>> {
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch booking details: ${res.status}`);
  }
  return res.json();
}

export async function getPartnerHotelBookings(
  hotelId: string,
  token: string
): Promise<ApiResponse<HotelBookingDto[]>> {
  const res = await fetch(`${API_BASE_URL}/partner/hotels/${encodeURIComponent(hotelId)}/bookings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch partner bookings: ${res.status}`);
  }
  return res.json();
}

export async function cancelHotelBooking(
  bookingReference: string,
  options?: { reason?: string; reasonCode?: string },
  token?: string
): Promise<ApiResponse<HotelBookingDto>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/cancel`, {
    method: 'POST',
    headers,
    body: JSON.stringify(options || {}),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to cancel booking: ${res.status}`);
  }
  return res.json();
}

export interface CreatePaymentOrderResponse {
  bookingReference: string;
  provider: string;
  providerOrderId: string;
  keyId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  status: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentTransactionDto {
  id: string;
  bookingReference: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  failureCode?: string;
  failureDescription?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface PaymentStatusResponse {
  bookingReference: string;
  bookingStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  paymentGatewayAvailable: boolean;
  provider: string;
  activeOrderId?: string;
  transactions: PaymentTransactionDto[];
}

export async function createHotelPaymentOrder(
  bookingReference: string,
  token: string
): Promise<ApiResponse<CreatePaymentOrderResponse>> {
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/payment/order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create payment order: ${res.status}`);
  }
  return res.json();
}

export async function verifyHotelPayment(
  bookingReference: string,
  data: VerifyPaymentRequest,
  token: string
): Promise<ApiResponse<HotelBookingDto>> {
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/payment/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to verify payment: ${res.status}`);
  }
  return res.json();
}

export async function getHotelPaymentStatus(
  bookingReference: string,
  token: string
): Promise<ApiResponse<PaymentStatusResponse>> {
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/payment`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch payment status: ${res.status}`);
  }
  return res.json();
}

// --------------------------------------------------------------------------
// Phase 22.9 — Confirmation, Voucher & Notification Engine
// --------------------------------------------------------------------------

export interface BookingTimelineEntryDto {
  status: string;
  paymentStatus?: string;
  notes?: string;
  reasonCode?: string;
  timestamp: string;
}

export interface BookingConfirmationDto {
  bookingReference: string;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
  confirmedAt?: string;
  hotelId: string;
  hotelName: string;
  hotelAddress?: string;
  hotelCity?: string;
  hotelState?: string;
  hotelStars?: number;
  hotelSourceType?: string;
  roomTypeId: string;
  roomTypeName: string;
  roomCapacity?: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfRooms: number;
  numberOfGuests: number;
  guestFullName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  basePriceSnapshot: number;
  taxesAmount: number;
  totalAmount: number;
  currency: string;
  taxDisclosure: string;
  pricingProvenance: string;
  cancellationPolicySnapshot?: string;
  cancellationDeadline?: string;
  cancellationRefundState?: string;
  cancellationDisclosure?: string;
  timeline: BookingTimelineEntryDto[];
  voucherAvailable: boolean;
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  category: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export async function getBookingConfirmation(
  bookingReference: string,
  token: string
): Promise<ApiResponse<BookingConfirmationDto>> {
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/confirmation`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch booking confirmation: ${res.status}`);
  }
  return res.json();
}

export async function downloadBookingVoucher(
  bookingReference: string,
  token: string
): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingReference)}/voucher`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to download voucher: ${res.status}`);
  }
  return res.blob();
}

export async function getMyNotifications(
  token: string,
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<NotificationDto[]>> {
  const res = await fetch(`${API_BASE_URL}/notifications?limit=${limit}&offset=${offset}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch notifications: ${res.status}`);
  }
  return res.json();
}

export async function getUnreadNotificationCount(
  token: string
): Promise<ApiResponse<{ unreadCount: number }>> {
  const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch unread count: ${res.status}`);
  }
  return res.json();
}

export async function markNotificationAsRead(
  notificationId: string,
  token: string
): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to mark notification as read: ${res.status}`);
  }
  return res.json();
}

export async function markAllNotificationsAsRead(
  token: string
): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to mark all notifications as read: ${res.status}`);
  }
  return res.json();
}
