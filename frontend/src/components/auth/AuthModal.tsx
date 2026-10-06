'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDefaultDashboardForRole } from '@/context/AuthContext';
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
    authModalReturnTo,
    login,
    loginAsSihDemo,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoadingKey, setDemoLoadingKey] = useState<string | null>(null);
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
      setDemoLoadingKey(null);
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
    const targetRole = authModalTargetRole;
    const returnTo = authModalReturnTo;
    try {
      const profile = await login(email, password);
      closeAuthModal();
      const resolvedRole = profile?.role || targetRole;
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push(getDefaultDashboardForRole(resolvedRole));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSihDemo = async (
    key: 'TOURIST' | 'GUIDE' | 'CULTURE_HOST' | 'HOTEL_PROVIDER',
    targetRoute: string
  ) => {
    setDemoLoadingKey(key);
    setError(null);
    const returnTo = authModalReturnTo;
    try {
      const profile = await loginAsSihDemo(key);
      closeAuthModal();

      if (returnTo) {
        router.push(returnTo);
      } else {
        const dest = profile?.role === 'PARTNER'
          ? '/partner/dashboard'
          : profile?.role === 'GOVERNMENT'
          ? '/government/dashboard'
          : targetRoute || '/dashboard';
        router.push(dest);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setDemoLoadingKey(null);
    }
  };

  const sihModalAccounts = [
    {
      key: 'TOURIST' as const,
      roleBadge: 'TOURIST',
      label: 'SIH Demo Tourist',
      email: 'tourist@yatrasetu.demo',
      sub: 'Explorer Persona • Real-time Trip & Hotel Bookings',
      targetRoute: '/explore',
      icon: Compass,
      textColor: 'text-amber-700',
      bgClass: 'bg-amber-50/80 hover:bg-amber-50 border-amber-200/90 hover:border-amber-400',
      iconBg: 'bg-amber-100',
      iconColor: 'text-[#F59E0B]',
      badgeBg: 'bg-amber-200/80 text-amber-900',
    },
    {
      key: 'GUIDE' as const,
      roleBadge: 'GUIDE',
      label: 'Ravi Kumar (Guide)',
      email: 'ravi.guide@yatrasetu.demo',
      sub: 'Heritage & Temple Guide • Tirupati (host-5)',
      targetRoute: '/partner/dashboard',
      icon: Briefcase,
      textColor: 'text-[#0F766E]',
      bgClass: 'bg-teal-50/70 hover:bg-teal-50 border-teal-200/90 hover:border-teal-400',
      iconBg: 'bg-teal-100',
      iconColor: 'text-[#0F766E]',
      badgeBg: 'bg-teal-200/80 text-teal-900',
    },
    {
      key: 'CULTURE_HOST' as const,
      roleBadge: 'ARTISAN',
      label: 'Smt. Lakshmi Prasanna',
      email: 'lakshmi.host@yatrasetu.demo',
      sub: 'Kalamkari Artisan • Tirupati (host-45)',
      targetRoute: '/partner/dashboard',
      icon: Briefcase,
      textColor: 'text-purple-700',
      bgClass: 'bg-purple-50/70 hover:bg-purple-50 border-purple-200/90 hover:border-purple-400',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-200/80 text-purple-900',
    },
    {
      key: 'HOTEL_PROVIDER' as const,
      roleBadge: 'HOTEL',
      label: 'Tirupati Hotel Provider',
      email: 'tirupati.hotel@yatrasetu.demo',
      sub: 'Tirupati Grand Residency • Reservations',
      targetRoute: '/partner/dashboard',
      icon: Landmark,
      textColor: 'text-blue-700',
      bgClass: 'bg-blue-50/70 hover:bg-blue-50 border-blue-200/90 hover:border-blue-400',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-200/80 text-blue-900',
    },
  ];

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
            SIH Grand Finale Multi-Tenant Demo
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Sign In Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
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
                  placeholder="tourist@yatrasetu.demo"
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
              disabled={loading || Boolean(demoLoadingKey)}
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
            <span className="bg-[#FFFBF5] px-3 text-[11px] font-bold uppercase tracking-widest text-[#312E81] whitespace-nowrap">
              SIH Demo Accounts
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Demo Account Section */}
          <div className="space-y-2">
            {sihModalAccounts.map(({ key, roleBadge, label, email: accEmail, sub, targetRoute, icon: Icon, textColor, bgClass, iconBg, iconColor, badgeBg }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectSihDemo(key, targetRoute)}
                disabled={loading || Boolean(demoLoadingKey)}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between group ${bgClass} shadow-sm`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5 flex-wrap">
                      <span>{label}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${badgeBg}`}>{roleBadge}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{accEmail}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold ${textColor} group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2`}>
                  {demoLoadingKey === key ? 'Entering...' : '→'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
