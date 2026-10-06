'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  UserProfile,
  PartnerProfile,
  syncUserSession,
  getMyProfile,
  updateMyProfile,
  getPartnerProfile,
  updatePartnerProfile,
} from '@/lib/api';

export const SIH_DEMO_ACCOUNTS = {
  TOURIST: {
    key: 'TOURIST' as const,
    role: 'TRAVELER' as const,
    name: 'SIH Demo Tourist',
    email: 'tourist@yatrasetu.demo',
    password: 'Tourist@SIH2026',
    description: 'Explorer Persona • Real-time Trip & Hotel Bookings',
  },
  GUIDE: {
    key: 'GUIDE' as const,
    role: 'PARTNER' as const,
    partnerSubtype: 'GUIDE' as const,
    name: 'Ravi Kumar',
    email: 'ravi.guide@yatrasetu.demo',
    password: 'RaviGuide@SIH2026',
    description: 'Heritage & Temple Guide • Tirupati (host-5)',
  },
  CULTURE_HOST: {
    key: 'CULTURE_HOST' as const,
    role: 'PARTNER' as const,
    partnerSubtype: 'ARTISAN' as const,
    name: 'Smt. Lakshmi Prasanna',
    email: 'lakshmi.host@yatrasetu.demo',
    password: 'LakshmiHost@SIH2026',
    description: 'Kalamkari Artisan & Culture Custodian • Tirupati (host-45)',
  },
  HOTEL_PROVIDER: {
    key: 'HOTEL_PROVIDER' as const,
    role: 'PARTNER' as const,
    partnerSubtype: 'HOTEL' as const,
    name: 'Srinivasa Rao',
    email: 'tirupati.hotel@yatrasetu.demo',
    password: 'TirupatiHotel@SIH2026',
    description: 'Tirupati Grand Residency Provider • Reservations & QR Check-in',
  },
  TRANSPORT: {
    key: 'TRANSPORT' as const,
    role: 'PARTNER' as const,
    partnerSubtype: 'TRANSPORT' as const,
    name: 'Arjun Varma',
    email: 'arjun.travels@yatrasetu.demo',
    password: 'ArjunTravels@SIH2026',
    description: 'Arjun Travels • Regional Transport Partner (host-125)',
  },
  GOVERNMENT: {
    key: 'GOVERNMENT' as const,
    role: 'GOVERNMENT' as const,
    name: 'Ministry of Tourism Official',
    email: 'official@tourism.gov.in',
    password: 'Govt@SIH2026',
    description: 'National & Regional Tourism Intelligence Authority',
  },
};

export type SihDemoAccountKey = keyof typeof SIH_DEMO_ACCOUNTS;

export function getDefaultDashboardForRole(role?: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null): string {
  if (role === 'PARTNER') return '/partner/dashboard';
  if (role === 'GOVERNMENT') return '/government/dashboard';
  return '/dashboard';
}

interface AuthContextType {
  user: UserProfile | null;
  partnerDetails: PartnerProfile | null;
  token: string | null;
  loading: boolean;
  role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTargetRole: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null;
  authModalReturnTo: string | null;
  openAuthModal: (targetRole?: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null, returnTo?: string | null) => void;
  closeAuthModal: () => void;
  requireAuth: (destination: string, targetRole?: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  loginWithGoogle: (returnTo?: string | null) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password?: string,
    role?: 'TRAVELER' | 'PARTNER',
    partnerSubtype?: string
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateTravelerProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePartner: (data: Partial<PartnerProfile>) => Promise<void>;
  loginAsDemo: (role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => Promise<UserProfile>;
  loginAsSihDemo: (accountKey: SihDemoAccountKey) => Promise<UserProfile>;
  setUserVerification: (status: { aadhaarVerified?: boolean; aadhaarNumber?: string; dgLockerConnected?: boolean }) => void;
  setGuideVerification: (status: { linkedinUrl?: string; instagramUrl?: string; dgLockerVerified?: boolean; aadhaarLast4?: string; residencyProof?: string; residencyYears?: number }) => void;
  setHotelVerification: (status: { hotelName?: string; hotelCity?: string; hotelAddress?: string; hotelPhone?: string; hotelEmail?: string; hotelWebsite?: string; hotelType?: string; totalRooms?: string; photos?: string[]; billingReceipts?: string[]; businessProofs?: string[] }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<PartnerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null>(null);
  const [authModalReturnTo, setAuthModalReturnTo] = useState<string | null>(null);

  const openAuthModal = useCallback((targetRole?: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null, returnTo?: string | null) => {
    setAuthModalTargetRole(targetRole || null);
    setAuthModalReturnTo(returnTo || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalTargetRole(null);
    setAuthModalReturnTo(null);
  }, []);

  const requireAuth = useCallback((destination: string, targetRole: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' = 'TRAVELER'): boolean => {
    if (user) {
      router.push(destination);
      return true;
    }
    openAuthModal(targetRole, destination);
    return false;
  }, [user, router, openAuthModal]);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      try {
        // Clean up legacy mock user keys if present
        localStorage.removeItem('yatrasetu_mock_user');
        localStorage.removeItem('yatrasetu_mock_token');
        localStorage.removeItem('yatrasetu_mock_partner');

        let sessionRestored = false;

        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const jwt = session.access_token;
            setToken(jwt);
            const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Traveler';
            const syncRes = await syncUserSession(
              session.user.id,
              session.user.email || '',
              fullName,
              session.user.user_metadata?.role,
              session.user.user_metadata?.partnerSubtype,
              jwt
            ).catch(() => null);

            if (syncRes?.data) {
              setUser(syncRes.data);
              localStorage.setItem('yatrasetu_auth_user', JSON.stringify(syncRes.data));
              localStorage.setItem('yatrasetu_auth_token', jwt);

              if (syncRes.data.role === 'PARTNER') {
                const partnerRes = await getPartnerProfile(jwt).catch(() => null);
                if (partnerRes?.data) {
                  setPartnerDetails(partnerRes.data);
                  localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(partnerRes.data));
                }
              } else {
                setPartnerDetails(null);
                localStorage.removeItem('yatrasetu_auth_partner');
              }
              sessionRestored = true;
            } else {
              // Explicitly clear stale user & local storage if profile sync fails/not found
              setUser(null);
              setPartnerDetails(null);
              setToken(null);
              localStorage.removeItem('yatrasetu_auth_user');
              localStorage.removeItem('yatrasetu_auth_token');
              localStorage.removeItem('yatrasetu_auth_partner');
            }
          }
        }

        if (!sessionRestored) {
          // Check real authenticated session in localStorage (for Phone / Local sessions)
          const savedUser = localStorage.getItem('yatrasetu_auth_user');
          const savedToken = localStorage.getItem('yatrasetu_auth_token');
          if (savedUser && savedToken) {
            const parsed = JSON.parse(savedUser);
            // Only restore if not a demo account (demo accounts must be explicitly clicked)
            if (parsed && !parsed.email?.endsWith('.demo')) {
              setUser(parsed);
              setToken(savedToken);
              if (parsed.role === 'PARTNER') {
                const savedPartner = localStorage.getItem('yatrasetu_auth_partner');
                if (savedPartner) setPartnerDetails(JSON.parse(savedPartner));
              }

              // Asynchronously re-sync with backend to get latest authoritative server state
              syncUserSession(
                parsed.id || 'usr-session',
                parsed.email,
                parsed.fullName,
                parsed.role,
                parsed.partnerSubtype,
                savedToken,
                false // DO NOT AUTO-CREATE
              ).then(async (syncRes) => {
                if (syncRes?.data) {
                  setUser(syncRes.data);
                  localStorage.setItem('yatrasetu_auth_user', JSON.stringify(syncRes.data));
                  if (syncRes.data.role === 'PARTNER') {
                    const pRes = await getPartnerProfile(savedToken).catch(() => null);
                    if (pRes?.data) {
                      setPartnerDetails(pRes.data);
                      localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pRes.data));
                    }
                  } else {
                    setPartnerDetails(null);
                    localStorage.removeItem('yatrasetu_auth_partner');
                  }
                }
              }).catch((syncErr) => {
                console.warn('Background session re-sync note:', syncErr.message);
                if (syncErr?.message?.includes('NO_YATRASETU_PROFILE') || syncErr?.status === 404) {
                  setUser(null);
                  setPartnerDetails(null);
                  setToken(null);
                  localStorage.removeItem('yatrasetu_auth_user');
                  localStorage.removeItem('yatrasetu_auth_token');
                  localStorage.removeItem('yatrasetu_auth_partner');
                }
              });
            } else {
              // Stale demo user in localStorage - purge
              localStorage.removeItem('yatrasetu_auth_user');
              localStorage.removeItem('yatrasetu_auth_token');
              localStorage.removeItem('yatrasetu_auth_partner');
            }
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Supabase auth state listener
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const jwt = session.access_token;
          setToken(jwt);
          try {
            const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Traveler';
            const res = await syncUserSession(
              session.user.id,
              session.user.email || '',
              fullName,
              session.user.user_metadata?.role,
              session.user.user_metadata?.partnerSubtype,
              jwt,
              false // DO NOT AUTO-CREATE
            );
            setUser(res.data);
            localStorage.setItem('yatrasetu_auth_user', JSON.stringify(res.data));
            localStorage.setItem('yatrasetu_auth_token', jwt);
            if (res.data.role === 'PARTNER') {
              const pRes = await getPartnerProfile(jwt).catch(() => null);
              if (pRes?.data) {
                setPartnerDetails(pRes.data);
                localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pRes.data));
              }
            } else {
              setPartnerDetails(null);
              localStorage.removeItem('yatrasetu_auth_partner');
            }
          } catch (e: any) {
            console.warn('Auth state sync note:', e.message);
            if (e?.message?.includes('NO_YATRASETU_PROFILE') || e?.status === 404) {
              setUser(null);
              setPartnerDetails(null);
              setToken(null);
              localStorage.removeItem('yatrasetu_auth_user');
              localStorage.removeItem('yatrasetu_auth_token');
              localStorage.removeItem('yatrasetu_auth_partner');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          clearAuthState();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setPartnerDetails(null);
    setToken(null);
    localStorage.removeItem('yatrasetu_auth_user');
    localStorage.removeItem('yatrasetu_auth_token');
    localStorage.removeItem('yatrasetu_auth_partner');
    localStorage.removeItem('yatrasetu_mock_user');
    localStorage.removeItem('yatrasetu_mock_token');
    localStorage.removeItem('yatrasetu_mock_partner');
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    clearAuthState();
    try {
      if (isSupabaseConfigured && password) {
        let authResult;
        try {
          authResult = await supabase.auth.signInWithPassword({ email, password });
        } catch (supabaseErr: any) {
          if (supabaseErr?.message?.includes('fetch') || supabaseErr?.name === 'TypeError') {
            console.warn('Supabase service unreachable, authenticating via YatraSetu backend:', supabaseErr);
          } else {
            throw supabaseErr;
          }
        }

        if (authResult?.error) {
          const errorMsg = authResult.error.message;
          if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
            // Safely check if a YatraSetu profile exists for this email in backend
            try {
              const checkRes = await syncUserSession(
                '',
                email,
                '',
                undefined,
                undefined,
                undefined,
                false // DO NOT AUTO-CREATE
              );
              if (checkRes?.data) {
                // Profile exists in YatraSetu DB -> wrong password entered for existing account
                throw new Error('Invalid email or password. Please check your credentials.');
              }
            } catch (checkErr: any) {
              if (checkErr?.message?.includes('NO_YATRASETU_PROFILE') || checkErr?.status === 404) {
                // No YatraSetu profile exists for this email -> Unregistered user
                throw new Error('NO_YATRASETU_PROFILE');
              }
            }
            throw new Error('Invalid email or password. Please check your credentials.');
          }
          throw new Error(errorMsg || 'Authentication failed.');
        }

        if (authResult?.data?.session) {
          const session = authResult.data.session;
          const jwt = session.access_token;
          setToken(jwt);
          try {
            const syncRes = await syncUserSession(
              session.user.id,
              session.user.email || email,
              session.user.user_metadata?.full_name || email.split('@')[0],
              session.user.user_metadata?.role,
              session.user.user_metadata?.partnerSubtype,
              jwt,
              false // DO NOT AUTO-CREATE PROFILE ON LOGIN
            );
            setUser(syncRes.data);
            localStorage.setItem('yatrasetu_auth_user', JSON.stringify(syncRes.data));
            localStorage.setItem('yatrasetu_auth_token', jwt);
            if (syncRes.data.role === 'PARTNER') {
              const partnerRes = await getPartnerProfile(jwt).catch(() => null);
              if (partnerRes?.data) {
                setPartnerDetails(partnerRes.data);
                localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(partnerRes.data));
              }
            } else {
              setPartnerDetails(null);
              localStorage.removeItem('yatrasetu_auth_partner');
            }
            return syncRes.data;
          } catch (syncErr: any) {
            setUser(null);
            setPartnerDetails(null);
            setToken(null);
            localStorage.removeItem('yatrasetu_auth_user');
            localStorage.removeItem('yatrasetu_auth_token');
            localStorage.removeItem('yatrasetu_auth_partner');
            if (syncErr?.message?.includes('NO_YATRASETU_PROFILE') || syncErr?.status === 404) {
              throw new Error('NO_YATRASETU_PROFILE');
            }
            throw syncErr;
          }
        }
      }

      // Backend sync authentication
      const authUserId = `auth-${email.toLowerCase().trim()}`;
      const mockJwt = `auth-${email.toLowerCase().trim()}`;
      setToken(mockJwt);
      try {
        const res = await syncUserSession(
          authUserId,
          email,
          email.split('@')[0],
          undefined,
          undefined,
          mockJwt,
          false // DO NOT AUTO-CREATE PROFILE ON LOGIN
        );
        setUser(res.data);
        localStorage.setItem('yatrasetu_auth_user', JSON.stringify(res.data));
        localStorage.setItem('yatrasetu_auth_token', mockJwt);

        if (res.data.role === 'PARTNER') {
          const pRes = await getPartnerProfile(mockJwt).catch(() => null);
          if (pRes?.data) {
            setPartnerDetails(pRes.data);
            localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pRes.data));
          }
        } else {
          setPartnerDetails(null);
          localStorage.removeItem('yatrasetu_auth_partner');
        }
        return res.data;
      } catch (syncErr: any) {
        setUser(null);
        setPartnerDetails(null);
        setToken(null);
        localStorage.removeItem('yatrasetu_auth_user');
        localStorage.removeItem('yatrasetu_auth_token');
        localStorage.removeItem('yatrasetu_auth_partner');
        if (syncErr?.message?.includes('NO_YATRASETU_PROFILE') || syncErr?.status === 404) {
          throw new Error('NO_YATRASETU_PROFILE');
        }
        throw syncErr;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('Unable to complete email sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const loginWithGoogle = async (returnTo?: string | null) => {
    setLoading(true);
    try {
      console.log('[Google OAuth Diagnosis] isSupabaseConfigured:', isSupabaseConfigured);
      console.log('[Google OAuth Diagnosis] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set');

      if (!isSupabaseConfigured) {
        throw new Error(
          'Google authentication service is not configured. Please check your Supabase environment settings.'
        );
      }

      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

      const redirectUrl = `${origin}/auth/callback${
        returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : ''
      }`;

      console.log('[Google OAuth Diagnosis] Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (error) {
        console.error('[Google OAuth Diagnosis] signInWithOAuth error:', error);
        throw new Error(error.message || 'Failed to start Google authentication.');
      } else {
        console.log('[Google OAuth Diagnosis] signInWithOAuth initiated successfully:', data);
      }
    } finally {
      setLoading(false);
    }
  };

  const setUserVerification = async (status: { aadhaarVerified?: boolean; aadhaarNumber?: string; dgLockerConnected?: boolean }) => {
    if (user) {
      const isVerified = status.aadhaarVerified ?? true;
      const updated = { ...user, ...status, verified: isVerified, aadhaarVerified: isVerified };
      setUser(updated);
      localStorage.setItem('yatrasetu_auth_user', JSON.stringify(updated));

      try {
        await updateMyProfile({ verified: isVerified, aadhaarVerified: isVerified } as any, token || undefined);
      } catch (err) {
        console.warn('Persisting verification to backend warning:', err);
      }
    }
  };

  const setGuideVerification = (status: { linkedinUrl?: string; instagramUrl?: string; dgLockerVerified?: boolean; aadhaarLast4?: string; residencyProof?: string; residencyYears?: number }) => {
    if (partnerDetails) {
      const updated = { ...partnerDetails, ...status };
      setPartnerDetails(updated);
      localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(updated));
    }
  };

  const setHotelVerification = (status: { hotelName?: string; hotelCity?: string; hotelAddress?: string; hotelPhone?: string; hotelEmail?: string; hotelWebsite?: string; hotelType?: string; totalRooms?: string; photos?: string[]; billingReceipts?: string[]; businessProofs?: string[] }) => {
    if (partnerDetails) {
      const updated = { ...partnerDetails, ...status };
      setPartnerDetails(updated);
      localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(updated));
    }
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    role: 'TRAVELER' | 'PARTNER' = 'TRAVELER',
    partnerSubtype?: string
  ) => {
    setLoading(true);
    clearAuthState();
    try {
      const defaultToken = `mock-${role.toLowerCase()}-${email}`;
      let jwt = defaultToken;
      let authUserId: string | undefined = undefined;

      if (isSupabaseConfigured && password) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name, role, partnerSubtype },
            },
          });
          if (error) throw error;
          if (data.session) {
            jwt = data.session.access_token;
          }
          if (data.user) {
            authUserId = data.user.id;
          }
        } catch (supabaseErr: any) {
          if (supabaseErr?.message?.includes('fetch') || supabaseErr?.name === 'TypeError') {
            console.warn('Supabase service unreachable during signup, creating account via YatraSetu backend:', supabaseErr);
          } else {
            throw supabaseErr;
          }
        }
      }

      if (isSupabaseConfigured && !authUserId) {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession?.user) {
          authUserId = existingSession.user.id;
          jwt = existingSession.access_token;
        }
      }

      setToken(jwt);
      let profileData: UserProfile;
      try {
        const syncRes = await syncUserSession(
          authUserId || `usr-${Date.now()}`,
          email,
          name,
          role,
          partnerSubtype,
          jwt,
          true // CREATE PROFILE ON EXPLICIT SIGNUP
        );
        profileData = syncRes.data;
      } catch (error) {
        console.warn('Backend sync note during signup:', error);
        profileData = {
          id: authUserId || `usr-${Date.now()}`,
          email,
          fullName: name,
          role,
          partnerSubtype,
          verified: role !== 'PARTNER',
        };
      }

      setUser(profileData);
      localStorage.setItem('yatrasetu_auth_user', JSON.stringify(profileData));
      localStorage.setItem('yatrasetu_auth_token', jwt);

      if (role === 'PARTNER') {
        const partnerRes = await getPartnerProfile(jwt).catch(() => null);
        if (partnerRes?.data) {
          setPartnerDetails(partnerRes.data);
          localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(partnerRes.data));
        } else {
          const pData: PartnerProfile = {
            id: profileData.id,
            email: profileData.email,
            fullName: profileData.fullName,
            businessName: '',
            role: 'PARTNER',
            partnerSubtype: (partnerSubtype as any) || 'GUIDE',
            verificationStatus: 'PENDING',
            verified: false,
          };
          setPartnerDetails(pData);
          localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pData));
        }
      } else {
        setPartnerDetails(null);
        localStorage.removeItem('yatrasetu_auth_partner');
      }
      return profileData;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (demoRole: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    setLoading(true);
    clearAuthState();
    try {
      const emailMap = {
        TRAVELER: 'traveler@yatrasetu.in',
        PARTNER: 'partner@yatrasetu.in',
        GOVERNMENT: 'official@tourism.gov.in',
      };
      const nameMap = {
        TRAVELER: 'Aditi Sharma (Demo Traveler)',
        PARTNER: 'Rajesh Guide (Demo Partner)',
        GOVERNMENT: 'Director General of Tourism',
      };

      const email = emailMap[demoRole];
      const name = nameMap[demoRole];
      const mockJwt = `mock-${demoRole.toLowerCase()}-${email}`;

      // In test profile or dev environment, sync with backend
      let profileData: UserProfile;
      try {
        const res = await syncUserSession(
          `mock-${demoRole.toLowerCase()}-id`,
          email,
          name,
          demoRole,
          demoRole === 'PARTNER' ? 'GUIDE' : undefined,
          mockJwt
        );
        profileData = res.data;
        profileData.role = demoRole;
      } catch (e) {
        // Fallback local state if backend is off
        profileData = {
          id: `usr-${demoRole.toLowerCase()}-1`,
          email,
          fullName: name,
          role: demoRole,
          partnerSubtype: demoRole === 'PARTNER' ? 'GUIDE' : undefined,
          verified: demoRole === 'GOVERNMENT' || demoRole === 'TRAVELER',
        };
      }

      setUser(profileData);
      setToken(mockJwt);
      localStorage.setItem('yatrasetu_auth_user', JSON.stringify(profileData));
      localStorage.setItem('yatrasetu_auth_token', mockJwt);

      if (demoRole === 'PARTNER') {
        const pDetails: PartnerProfile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.fullName,
          businessName: 'Rajesh Heritage Walks',
          role: 'PARTNER',
          partnerSubtype: 'GUIDE',
          city: 'Hampi',
          state: 'Karnataka',
          bio: 'Expert storytelling and architectural tours of Vijayanagara ruins.',
          languages: ['Kannada', 'English', 'Hindi'],
          partnerSkills: ['Storytelling', 'Temple Architecture', 'Photography'],
          verificationStatus: 'APPROVED',
          verified: true,
        };
        setPartnerDetails(pDetails);
        localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pDetails));
      } else {
        setPartnerDetails(null);
        localStorage.removeItem('yatrasetu_auth_partner');
      }
      return profileData;
    } finally {
      setLoading(false);
    }
  };

  const loginAsSihDemo = async (accountKey: SihDemoAccountKey) => {
    const acc = SIH_DEMO_ACCOUNTS[accountKey];
    if (!acc) throw new Error(`Demo account not found: ${accountKey}`);
    setLoading(true);
    clearAuthState();
    try {
      const mockJwt = `mock-${acc.role.toLowerCase()}-${acc.email}`;
      let jwt = mockJwt;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: acc.email,
          password: acc.password,
        });
        if (!error && data.session) {
          jwt = data.session.access_token;
        }
      }

      setToken(jwt);
      let profileData: UserProfile;
      try {
        const res = await syncUserSession(
          `usr-sih-${accountKey.toLowerCase()}`,
          acc.email,
          acc.name,
          acc.role,
          'partnerSubtype' in acc ? (acc as any).partnerSubtype : undefined,
          jwt
        );
        profileData = res.data;
        if (acc.role === 'GOVERNMENT') {
          profileData.role = 'GOVERNMENT';
        }
      } catch (syncErr) {
        console.warn('Backend sync note for SIH demo account:', syncErr);
        profileData = {
          id: `usr-sih-${accountKey.toLowerCase()}`,
          email: acc.email,
          fullName: acc.name,
          role: acc.role,
          partnerSubtype: 'partnerSubtype' in acc ? (acc as any).partnerSubtype : undefined,
          verified: true,
        };
      }

      setUser(profileData);
      localStorage.setItem('yatrasetu_auth_user', JSON.stringify(profileData));
      localStorage.setItem('yatrasetu_auth_token', jwt);

      if (profileData.role === 'PARTNER') {
        const pRes = await getPartnerProfile(jwt).catch(() => null);
        if (pRes?.data) {
          setPartnerDetails(pRes.data);
          localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pRes.data));
        } else {
          const initialPartner: PartnerProfile = {
            id: profileData.id,
            email: profileData.email,
            fullName: profileData.fullName,
            businessName: acc.name,
            role: 'PARTNER',
            partnerSubtype: ('partnerSubtype' in acc ? (acc as any).partnerSubtype : 'GUIDE'),
            city: 'Tirupati',
            state: 'Andhra Pradesh',
            verificationStatus: 'APPROVED',
            verified: true,
          };
          setPartnerDetails(initialPartner);
          localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(initialPartner));
        }
      } else {
        setPartnerDetails(null);
        localStorage.removeItem('yatrasetu_auth_partner');
      }
      return profileData;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut().catch(() => null);
      }
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const updateTravelerProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await updateMyProfile(data, token || undefined);
      setUser(res.data);
      localStorage.setItem('yatrasetu_auth_user', JSON.stringify(res.data));
    } catch (error) {
      console.warn('Backend profile update note:', error);
      if (user) {
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem('yatrasetu_auth_user', JSON.stringify(updated));
      }
    }
  };

  const updatePartner = async (data: Partial<PartnerProfile>) => {
    try {
      const res = await updatePartnerProfile(data, token || undefined);
      setPartnerDetails(res.data);
      localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(res.data));
    } catch (error) {
      console.warn('Backend unavailable; saved partner details locally as pending.', error);
      const localDetails = { ...(partnerDetails || {}), ...data, verificationStatus: 'PENDING' as const } as PartnerProfile;
      setPartnerDetails(localDetails);
      localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(localDetails));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        partnerDetails,
        token,
        loading,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        authModalTargetRole,
        authModalReturnTo,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateTravelerProfile,
        updatePartner,
        loginAsDemo,
        loginAsSihDemo,
        setUserVerification,
        setGuideVerification,
        setHotelVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
