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
