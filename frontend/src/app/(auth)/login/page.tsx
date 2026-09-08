'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Landmark,
  Eye,
  EyeOff,
  MapPin,
  Users,
  Star,
} from 'lucide-react';

type AuthMethod = 'email' | 'phone' | 'google';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  // Safe redirect validation: must start with single slash, not protocol-relative
  const targetRedirect = (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//'))
    ? rawRedirect
    : null;

  const { login, loginWithPhone, loginWithGoogle, loginAsDemo } = useAuth();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  
  // Email fields
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone fields
  const [phoneName, setPhoneName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(targetRedirect || '/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (!phoneName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginWithPhone(cleaned, phoneName.trim());
      router.push(targetRedirect || '/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with phone.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(targetRedirect || '/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    setDemoLoadingRole(role);
    setError(null);
    try {
      await loginAsDemo(role);
      if (targetRedirect) {
        router.push(targetRedirect);
      } else if (role === 'PARTNER') {
        router.push('/partner');
      } else if (role === 'GOVERNMENT') {
        router.push('/government');
      } else {
        router.push('/explore');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo login failed';
      setError(msg);
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const authMethodTabs = [
    { id: 'email' as const, label: 'Email', icon: Mail },
    { id: 'phone' as const, label: 'Phone', icon: Phone },
    { id: 'google' as const, label: 'Google', icon: Compass },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-[#312E81]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">YatraSetu</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#F59E0B]">
            <Compass className="w-3.5 h-3.5" />
            India&apos;s Connected Tourism Ecosystem
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Every journey
            <br />
            begins with a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">
              bridge.
            </span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
            Connecting India&apos;s 1.4 billion stories — travelers, local guides, and cultural custodians — into one living ecosystem.
          </p>

          <div className="flex items-center gap-6 pt-2">
            {[
              { icon: MapPin, value: '138', label: 'Cities' },
              { icon: Users, value: '743', label: 'POIs' },
              { icon: Star, value: '93', label: 'Destinations' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 text-[#F59E0B]">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-lg font-extrabold text-white">{value}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          28 States covered • Real-time tourism intelligence
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-10 bg-[#FFFBF5]">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <span className="text-xl font-bold text-[#312E81]">YatraSetu</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#64748B]">
              Sign in to continue your India journey.{' '}
              <Link
                href="/signup"
                className="text-[#312E81] font-semibold hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1"
              >
                New here? Create account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {authMethodTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setAuthMethod(id);
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  authMethod === id ? 'bg-white text-[#312E81] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authMethod === 'email' && (
            <form className="space-y-4 animate-fade-in-up" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#312E81] hover:text-[#F59E0B] font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(demoLoadingRole)}
                className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In with Email
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {authMethod === 'phone' && (
            <form className="space-y-4 animate-fade-in-up" onSubmit={handlePhoneSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none text-sm text-slate-500 font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-[4.5rem] pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">No OTP verification required for now</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-[#312E81] rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Phone
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {authMethod === 'google' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-center space-y-3 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Sign in with your Google account for quick access</p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-[#171717] font-semibold rounded-xl text-sm border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-[#312E81] rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">or try demo</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="space-y-2.5">
            {[
              {
                role: 'TRAVELER' as const,
                label: 'Traveler Demo',
                sub: 'Aditi Sharma • Explorer persona',
                icon: Compass,
                textColor: 'text-amber-700',
                bgClass: 'bg-amber-50/80 hover:bg-amber-50 border-slate-200 hover:border-amber-400',
                iconBg: 'bg-amber-100',
                iconColor: 'text-[#F59E0B]',
              },
              {
                role: 'PARTNER' as const,
                label: 'Local Partner Demo',
                sub: 'Rajesh Guide • Host & Guide portal',
                icon: Briefcase,
                textColor: 'text-[#0F766E]',
                bgClass: 'bg-teal-50/60 hover:bg-teal-50 border-slate-200 hover:border-teal-400',
                iconBg: 'bg-teal-100',
                iconColor: 'text-[#0F766E]',
              },
              {
                role: 'GOVERNMENT' as const,
                label: 'Government Authority Demo',
                sub: 'Director General • Tourism analytics',
                icon: Landmark,
                textColor: 'text-[#312E81]',
                bgClass: 'bg-indigo-50/60 hover:bg-indigo-50 border-slate-200 hover:border-indigo-400',
                iconBg: 'bg-indigo-100',
                iconColor: 'text-[#312E81]',
              },
            ].map(({ role, label, sub, icon: Icon, textColor, bgClass, iconBg, iconColor }) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemoLogin(role)}
                disabled={loading || Boolean(demoLoadingRole)}
                className={`w-full p-3 rounded-2xl border ${bgClass} text-left transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      {label}
                      <span className="text-[10px] px-1.5 rounded bg-slate-100 text-slate-500 font-medium">Demo</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold ${textColor} group-hover:translate-x-0.5 transition-transform`}>
                  {demoLoadingRole === role ? (
                    <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </span>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-center text-slate-400 leading-relaxed">Demo accounts are for platform exploration only.</p>
        </div>
      </div>
    </div>
  );
}
