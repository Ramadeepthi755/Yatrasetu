'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles, Users, Briefcase } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TRAVELER' | 'PARTNER'>('TRAVELER');
  const [partnerSubtype, setPartnerSubtype] = useState('GUIDE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signup(fullName, email, password, role, role === 'PARTNER' ? partnerSubtype : undefined);
      if (role === 'PARTNER') {
        router.push('/onboarding/partner');
      } else {
        router.push('/onboarding/traveler');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#312E81] to-[#4338CA] text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Join YatraSetu
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Be part of India&apos;s connected community tourism ecosystem.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Stakeholder Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-2">
              How will you use YatraSetu?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('TRAVELER')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  role === 'TRAVELER'
                    ? 'border-[#312E81] bg-indigo-50/50 ring-2 ring-[#312E81]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#312E81]/10 flex items-center justify-center text-[#312E81]">
                    <Users className="w-4 h-4" />
                  </div>
                  {role === 'TRAVELER' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#312E81]" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#171717]">Traveler</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Explore India, plan trips & connect locally
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('PARTNER')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  role === 'PARTNER'
                    ? 'border-[#0F766E] bg-teal-50/50 ring-2 ring-[#0F766E]'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  {role === 'PARTNER' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#171717]">Local Partner</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Guides, hosts, homestays & local businesses
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Partner Subtype Dropdown if PARTNER selected */}
          {role === 'PARTNER' && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-2">
              <label className="block text-xs font-semibold text-[#0F766E] uppercase tracking-wider">
                Partner Subtype
              </label>
              <select
                value={partnerSubtype}
                onChange={(e) => setPartnerSubtype(e.target.value)}
                className="w-full py-2.5 px-3 bg-white border border-teal-200 rounded-xl text-xs sm:text-sm text-[#171717] focus:border-[#0F766E] outline-none"
              >
                <option value="GUIDE">Local Guide / Storyteller</option>
                <option value="LOCAL_HOST">Community Host / Cultural Expert</option>
                <option value="EXPERIENCE_PROVIDER">Experience / Activity Provider</option>
                <option value="HOMESTAY">Homestay / Heritage Stay</option>
                <option value="HOTEL">Hotel / Resort</option>
                <option value="RESTAURANT">Local Cuisine / Culinary Host</option>
                <option value="ARTISAN">Artisan / Handloom Creator</option>
                <option value="PHOTOGRAPHER">Travel Photographer</option>
                <option value="OTHER">Other Tourism Provider</option>
              </select>
              <p className="text-[11px] text-teal-800">
                Partner accounts undergo review and are set to <strong>Pending Verification</strong> upon registration.
              </p>
            </div>
          )}

          {/* Basic Fields */}
          <div>
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] transition-all"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wider mb-1">
              Password (Min. 6 characters)
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#171717] placeholder:text-slate-400 focus:bg-white focus:border-[#312E81] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#312E81]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Continue to Setup'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#64748B]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#312E81] hover:text-[#F59E0B] font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
