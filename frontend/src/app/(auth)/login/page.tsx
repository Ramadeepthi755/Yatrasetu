'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    setLoading(true);
    try {
      await loginAsDemo(role);
      if (role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (role === 'GOVERNMENT') {
        router.push('/government/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Welcome to YatraSetu
          </h2>
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
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
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
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
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Stakeholder Sign-In Selector */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            Fast Demo Login (Explore Stakeholder Views)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('TRAVELER')}
              type="button"
              className="px-2 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-[#312E81] hover:bg-indigo-100 text-[11px] font-semibold transition-colors"
            >
              Traveler
            </button>
            <button
              onClick={() => handleDemoLogin('PARTNER')}
              type="button"
              className="px-2 py-2 rounded-lg bg-teal-50 border border-teal-100 text-[#0F766E] hover:bg-teal-100 text-[11px] font-semibold transition-colors"
            >
              Partner
            </button>
            <button
              onClick={() => handleDemoLogin('GOVERNMENT')}
              type="button"
              className="px-2 py-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold transition-colors"
            >
              Government
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
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
