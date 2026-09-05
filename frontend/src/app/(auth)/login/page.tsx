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
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Welcome to YatraSetu
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Sign in to discover India, connect locally, and plan journeys.
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#312E81] hover:text-[#F59E0B] font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(demoLoadingRole)}
            className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
            OR
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Demo Account Section */}
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#171717] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
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
              onClick={() => handleDemoLogin('TRAVELER')}
              disabled={loading || Boolean(demoLoadingRole)}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-left transition-all flex items-center justify-between group"
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
              onClick={() => handleDemoLogin('PARTNER')}
              disabled={loading || Boolean(demoLoadingRole)}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-left transition-all flex items-center justify-between group"
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
              onClick={() => handleDemoLogin('GOVERNMENT')}
              disabled={loading || Boolean(demoLoadingRole)}
              className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all flex items-center justify-between group"
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

          <p className="text-[11px] text-center text-slate-400 leading-relaxed px-2 pt-1">
            Demo accounts are provided for platform exploration and do not represent verified real-world users.
          </p>
        </div>

        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-xs text-[#64748B]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#312E81] hover:text-[#F59E0B] font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
