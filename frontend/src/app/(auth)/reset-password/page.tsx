'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Lock, ArrowRight, CheckCircle, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initRecoverySession() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setError('Supabase authentication service is not configured.');
          setSessionLoading(false);
        }
        return;
      }

      try {
        // Step 1: Check if 'code' is present in URL search params (PKCE / OAuth authorization code flow)
        const code = searchParams.get('code');
        if (code) {
          console.log('[Reset Password] Found recovery code in URL, exchanging for session...');
          const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn('[Reset Password] Code exchange note:', exchangeErr.message);
          } else if (exchangeData?.session?.user) {
            console.log('[Reset Password] Recovery code exchanged successfully for user:', exchangeData.session.user.email);
            if (isMounted) {
              setHasRecoverySession(true);
              setSessionLoading(false);
            }
            return;
          }
        }

        // Step 2: Check for active session via getSession() (implicit/hash flow or established session)
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('[Reset Password] Active recovery session found via getSession()');
          if (isMounted) {
            setHasRecoverySession(true);
            setSessionLoading(false);
          }
          return;
        }

        // Step 3: Listen for auth state changes (e.g. PASSWORD_RECOVERY or SIGNED_IN event from hash fragment)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log('[Reset Password] Auth state event:', event, 'Has user:', Boolean(currentSession?.user));
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
            if (isMounted) {
              setHasRecoverySession(true);
              setSessionLoading(false);
            }
          }
        });

        // Step 4: Allow a short window for hash fragment processing before marking session missing
        const timer = setTimeout(() => {
          if (isMounted) {
            setSessionLoading(false);
          }
        }, 1200);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        console.error('[Reset Password] Recovery session initialization error:', err);
        if (isMounted) {
          setSessionLoading(false);
        }
      }
    }

    initRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#312E81] text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#171717]">Set New Password</h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Enter your new secure password below.
          </p>
        </div>

        {sessionLoading ? (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#312E81] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Verifying password recovery session...</p>
          </div>
        ) : success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">Password Updated!</h3>
            <p className="text-xs text-emerald-700">Redirecting you to sign in...</p>
          </div>
        ) : !hasRecoverySession ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-rose-900">Auth session missing!</h3>
            <p className="text-xs text-rose-700 leading-relaxed">
              Your password reset link is invalid, expired, or missing recovery session context. Please request a new link.
            </p>
            <div className="pt-2">
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-xs shadow-sm transition-all gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" /> Request New Reset Link
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#312E81] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] focus:bg-white focus:border-[#312E81] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : 'Update Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
