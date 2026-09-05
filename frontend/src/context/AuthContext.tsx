'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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

interface AuthContextType {
  user: UserProfile | null;
  partnerDetails: PartnerProfile | null;
  token: string | null;
  loading: boolean;
  role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTargetRole: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null;
  openAuthModal: (targetRole?: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password?: string,
    role?: 'TRAVELER' | 'PARTNER',
    partnerSubtype?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateTravelerProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePartner: (data: Partial<PartnerProfile>) => Promise<void>;
  loginAsDemo: (role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<PartnerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<'TRAVELER' | 'PARTNER' | 'GOVERNMENT' | null>(null);

  const openAuthModal = (targetRole?: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    setAuthModalTargetRole(targetRole || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalTargetRole(null);
  };

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const jwt = session.access_token;
            setToken(jwt);
            const syncRes = await syncUserSession(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name || 'Traveler',
              session.user.user_metadata?.role || 'TRAVELER',
              session.user.user_metadata?.partnerSubtype,
              jwt
            );
            setUser(syncRes.data);
            if (syncRes.data.role === 'PARTNER') {
              const partnerRes = await getPartnerProfile(jwt);
              setPartnerDetails(partnerRes.data);
            }
          }
        } else {
          // Clean up legacy mock user keys if present from previous demo switcher
          localStorage.removeItem('yatrasetu_mock_user');
          localStorage.removeItem('yatrasetu_mock_token');
          localStorage.removeItem('yatrasetu_mock_partner');

          // Check real authenticated session
          const savedUser = localStorage.getItem('yatrasetu_auth_user');
          const savedToken = localStorage.getItem('yatrasetu_auth_token');
          if (savedUser && savedToken) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setToken(savedToken);
            if (parsed.role === 'PARTNER') {
              const savedPartner = localStorage.getItem('yatrasetu_auth_partner');
              if (savedPartner) setPartnerDetails(JSON.parse(savedPartner));
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
        if (event === 'SIGNED_IN' && session?.user) {
          const jwt = session.access_token;
          setToken(jwt);
          try {
            const res = await syncUserSession(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name || 'Traveler',
              session.user.user_metadata?.role || 'TRAVELER',
              session.user.user_metadata?.partnerSubtype,
              jwt
            );
            setUser(res.data);
            if (res.data.role === 'PARTNER') {
              const pRes = await getPartnerProfile(jwt);
              setPartnerDetails(pRes.data);
            }
          } catch (e) {
            console.error('Error syncing auth session:', e);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setPartnerDetails(null);
          setToken(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          setToken(data.session.access_token);
        }
      } else {
        // Fallback sync with backend
        const mockJwt = `mock-user-${email}`;
        setToken(mockJwt);
        const res = await syncUserSession(`user-${email.replace(/[^a-zA-Z0-9]/g, '_')}`, email, email.split('@')[0], 'TRAVELER', undefined, mockJwt);
        setUser(res.data);
        localStorage.setItem('yatrasetu_auth_user', JSON.stringify(res.data));
        localStorage.setItem('yatrasetu_auth_token', mockJwt);
      }
    } finally {
      setLoading(false);
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
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, role, partnerSubtype },
          },
        });
        if (error) throw error;
        if (data.session) {
          setToken(data.session.access_token);
        }
      } else {
        const mockJwt = `auth-${role.toLowerCase()}-${email}`;
        setToken(mockJwt);
        const res = await syncUserSession(`usr-${Date.now()}`, email, name, role, partnerSubtype, mockJwt);
        setUser(res.data);
        localStorage.setItem('yatrasetu_auth_user', JSON.stringify(res.data));
        localStorage.setItem('yatrasetu_auth_token', mockJwt);
        if (role === 'PARTNER') {
          const pData: PartnerProfile = {
            id: res.data.id,
            email: res.data.email,
            fullName: res.data.fullName,
            businessName: `${name}'s Services`,
            role: 'PARTNER',
            partnerSubtype: (partnerSubtype as any) || 'LOCAL_HOST',
            verificationStatus: 'PENDING',
            verified: false,
          };
          setPartnerDetails(pData);
          localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pData));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (demoRole: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    setLoading(true);
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
          demoRole === 'GOVERNMENT' ? 'TRAVELER' : demoRole, // Prevent public sync of Gov role from client
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
          verificationStatus: 'PENDING',
          verified: false,
        };
        setPartnerDetails(pDetails);
        localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pDetails));
      } else {
        setPartnerDetails(null);
        localStorage.removeItem('yatrasetu_auth_partner');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setPartnerDetails(null);
      setToken(null);
      localStorage.removeItem('yatrasetu_auth_user');
      localStorage.removeItem('yatrasetu_auth_token');
      localStorage.removeItem('yatrasetu_auth_partner');
      localStorage.removeItem('yatrasetu_mock_user');
      localStorage.removeItem('yatrasetu_mock_token');
      localStorage.removeItem('yatrasetu_mock_partner');
    } finally {
      setLoading(false);
    }
  };

  const updateTravelerProfile = async (data: Partial<UserProfile>) => {
    const res = await updateMyProfile(data, token || undefined);
    setUser(res.data);
    localStorage.setItem('yatrasetu_auth_user', JSON.stringify(res.data));
  };

  const updatePartner = async (data: Partial<PartnerProfile>) => {
    const res = await updatePartnerProfile(data, token || undefined);
    setPartnerDetails(res.data);
    localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(res.data));
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
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        updateTravelerProfile,
        updatePartner,
        loginAsDemo,
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
