'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  X,
  Briefcase,
  Landmark,
} from 'lucide-react';

export default function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTargetRole,
    login,
    loginAsDemo,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close on ESC key and prevent body scroll
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset fields when opened/closed
  useEffect(() => {
    if (isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setDemoLoadingRole(null);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      closeAuthModal();
      // Route appropriately if target was set
      if (authModalTargetRole === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (authModalTargetRole === 'GOVERNMENT') {
        router.push('/government/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    setDemoLoadingRole(role);
    setError(null);
    try {
      await loginAsDemo(role);
      closeAuthModal();

      if (role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (role === 'GOVERNMENT') {
        router.push('/government/dashboard');
      } else {
        router.push('/explore');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Darkened Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#FFFBF5] rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 my-auto">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#312E81] via-[#3730A3] to-[#1E1B4B] p-6 text-white text-center relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
            aria-label="Close sign in dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg mx-auto mb-3">
            <Compass className="w-6 h-6 text-[#312E81]" />
          </div>

          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome to YatraSetu
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Sign in to continue
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Sign In Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@yatrasetu.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#312E81]/20 focus:border-[#312E81] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#312E81]/20 focus:border-[#312E81] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(demoLoadingRole)}
              className="w-full py-3 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-bold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-[#FFFBF5] px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
              OR
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Demo Account Section */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#171717] inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
                Try Demo Account
              </span>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Explore YatraSetu with a preconfigured demo account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Traveler Demo */}
              <button
                type="button"
                onClick={() => handleSelectDemo('TRAVELER')}
                disabled={loading || Boolean(demoLoadingRole)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  authModalTargetRole === 'TRAVELER'
                    ? 'border-[#F59E0B] bg-amber-50/80 ring-2 ring-[#F59E0B]/50'
                    : 'border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      Traveler Demo
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">Demo</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Aditi Sharma • Explorer persona</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                  {demoLoadingRole === 'TRAVELER' ? 'Entering...' : 'Continue →'}
                </span>
              </button>

              {/* Local Partner Demo */}
              <button
                type="button"
                onClick={() => handleSelectDemo('PARTNER')}
                disabled={loading || Boolean(demoLoadingRole)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  authModalTargetRole === 'PARTNER'
                    ? 'border-[#0F766E] bg-teal-50/80 ring-2 ring-[#0F766E]/50'
                    : 'border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0F766E] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      Local Partner Demo
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-medium">Demo</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Rajesh Guide • Host & Guide portal</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0F766E] group-hover:translate-x-0.5 transition-transform">
                  {demoLoadingRole === 'PARTNER' ? 'Entering...' : 'Continue →'}
                </span>
              </button>

              {/* Government Demo */}
              <button
                type="button"
                onClick={() => handleSelectDemo('GOVERNMENT')}
                disabled={loading || Boolean(demoLoadingRole)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  authModalTargetRole === 'GOVERNMENT'
                    ? 'border-[#312E81] bg-indigo-50/80 ring-2 ring-[#312E81]/50'
                    : 'border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-[#312E81] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      Government Demo
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">Demo</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Director General • Tourism analytics</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#312E81] group-hover:translate-x-0.5 transition-transform">
                  {demoLoadingRole === 'GOVERNMENT' ? 'Entering...' : 'Continue →'}
                </span>
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-center text-slate-400 leading-relaxed px-2 pt-1">
              Demo accounts are provided for platform exploration and do not represent verified real-world users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
