'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { syncUserSession, getPartnerProfile } from '@/lib/api';
import { getDefaultDashboardForRole } from '@/context/AuthContext';
import { Compass, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || null;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleOAuthCallback() {
      if (!isSupabaseConfigured) {
        setErrorMsg('Google authentication service is not configured. Please check your Supabase environment settings.');
        return;
      }

      try {
        const fullUrl = typeof window !== 'undefined' ? window.location.href : '';
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error') || searchParams.get('error_description');

        // Diagnostic logging (Requirement 2 - No sensitive tokens/secrets)
        console.log('[Google OAuth Callback] Current URL:', fullUrl);
        console.log('[Google OAuth Callback] Contains ?code=:', Boolean(code));
        console.log('[Google OAuth Callback] Contains ?error=:', Boolean(errorParam));

        if (errorParam) {
          console.error('[Google OAuth Callback] Provider error parameter:', errorParam);
          setErrorMsg(`OAuth Error: ${errorParam}`);
          return;
        }

        let session = null;
        let sessionError = null;

        // Step 1: Exchange PKCE authorization code if present in URL
        if (code) {
          console.log('[Google OAuth Callback] Exchanging authorization code for session...');
          const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn('[Google OAuth Callback] exchangeCodeForSession error:', exchangeErr.message);
            sessionError = exchangeErr;
          } else {
            console.log('[Google OAuth Callback] exchangeCodeForSession success:', Boolean(exchangeData?.session));
            session = exchangeData?.session || null;
          }
        }

        // Step 2: Fallback to active session retrieval if code exchange did not produce session
        if (!session) {
          console.log('[Google OAuth Callback] Retrieving active Supabase session via getSession()...');
          const { data, error } = await supabase.auth.getSession();
          session = data?.session || null;
          sessionError = error;
        }

        console.log('[Google OAuth Callback] Session retrieved successfully:', Boolean(session));

        if (!session?.user) {
          const failureReason = sessionError?.message || 'Failed to retrieve Google authenticated session.';
          console.error('[Google OAuth Callback] Session failure reason:', failureReason);
          setErrorMsg(failureReason);
          return;
        }

        const jwt = session.access_token;
        const user = session.user;
        const email = user.email || '';
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Traveler';

        console.log('[Google OAuth Callback] Authenticated Supabase user.id:', user.id);
        console.log('[Google OAuth Callback] Authenticated Supabase user.email:', email);

        // Step 3: Check YatraSetu profile using real Supabase user.id (createIfNotFound = false)
        try {
          const syncRes = await syncUserSession(
            user.id, // REAL SUPABASE USER UUID
            email,
            fullName,
            user.user_metadata?.role || 'TRAVELER',
            user.user_metadata?.partnerSubtype,
            jwt,
            false // DO NOT AUTO-CREATE PROFILE ON SIGN-IN
          );

          if (syncRes?.data) {
            console.log('[Google OAuth Callback] Profile found! User ID:', syncRes.data.id, 'Role:', syncRes.data.role);
            localStorage.setItem('yatrasetu_auth_user', JSON.stringify(syncRes.data));
            localStorage.setItem('yatrasetu_auth_token', jwt);

            if (syncRes.data.role === 'PARTNER') {
              const pRes = await getPartnerProfile(jwt).catch(() => null);
              if (pRes?.data) {
                localStorage.setItem('yatrasetu_auth_partner', JSON.stringify(pRes.data));
              }
            }
            
            const dest = redirectTarget || getDefaultDashboardForRole(syncRes.data.role);
            router.push(dest);
          }
        } catch (syncErr: any) {
          console.log('[Google OAuth Callback] Backend sync check result:', syncErr?.message || syncErr);
          localStorage.removeItem('yatrasetu_auth_user');
          localStorage.removeItem('yatrasetu_auth_token');
          localStorage.removeItem('yatrasetu_auth_partner');

          // No YatraSetu profile exists for this authenticated identity
          if (syncErr?.message?.includes('NO_YATRASETU_PROFILE') || syncErr?.status === 404) {
            console.log('[Google OAuth Callback] No profile found. Redirecting to signup flow for user.id:', user.id);
            router.push(`/signup?google=true&email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}&authId=${encodeURIComponent(user.id)}`);
          } else {
            setErrorMsg(syncErr?.message || 'Failed to check YatraSetu profile.');
          }
        }
      } catch (err: any) {
        console.error('[Google OAuth Callback] Exception during processing:', err);
        setErrorMsg(err?.message || 'An error occurred during Google authentication callback.');
      }
    }

    handleOAuthCallback();
  }, [router, redirectTarget, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#312E81] text-[#F59E0B] flex items-center justify-center mx-auto shadow-md">
          <Compass className="w-7 h-7 animate-spin" />
        </div>
        {errorMsg ? (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-2.5 bg-[#312E81] text-white font-semibold text-xs rounded-xl hover:bg-[#1E1B4B]"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-[#171717]">Completing Authentication...</h2>
            <p className="text-xs text-slate-500 mt-1">Verifying your YatraSetu identity</p>
          </div>
        )}
      </div>
    </div>
  );
}
