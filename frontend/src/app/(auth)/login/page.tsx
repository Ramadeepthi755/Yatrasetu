'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Briefcase,
  Landmark,
  Eye,
  EyeOff,
  MapPin,
  Users,
  Star,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in. Please verify your credentials.';
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
      if (role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (role === 'GOVERNMENT') {
        router.push('/government/dashboard');
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel — hero visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] overflow-hidden flex-col justify-between p-12">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        {/* Glowing orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-[#312E81]" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">YatraSetu</span>
        </div>

        {/* Central quote */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#F59E0B]">
            <Sparkles className="w-3.5 h-3.5" />
            India&apos;s Connected Tourism Ecosystem
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Every journey<br/>
            begins with a<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">bridge.</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
            Connecting India&apos;s 1.4 billion stories — travelers, local guides, and cultural custodians — into one living ecosystem.
          </p>

          {/* Stats row */}
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

        {/* Bottom badge */}
        <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          28 States covered • Real-time tourism intelligence
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-10 bg-[#FFFBF5]">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <span className="text-xl font-bold text-[#312E81]">YatraSetu</span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#64748B]">
              Sign in to continue your India journey.{' '}
              <Link href="/signup" className="text-[#312E81] font-semibold hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1">
                New here? Create account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#312E81] hover:text-[#F59E0B] font-medium transition-colors">
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
                  className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10 outline-none transition-all shadow-sm"
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
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">or try demo</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Demo accounts */}
          <div className="space-y-2.5">
            {[
              {
                role: 'TRAVELER' as const,
                label: 'Traveler Demo',
                sub: 'Aditi Sharma • Explorer persona',
                icon: Compass,
                color: 'amber',
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
                color: 'teal',
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
                color: 'indigo',
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

          <p className="text-[11px] text-center text-slate-400 leading-relaxed">
            Demo accounts are for platform exploration only.
          </p>
        </div>
      </div>
    </div>
  );
}
