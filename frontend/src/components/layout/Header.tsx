'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Users,
  MapPin,
  Sparkles,
  UserCircle,
  Landmark,
  Briefcase,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, role, isAuthenticated, logout, loginAsDemo } = useAuth();
  const router = useRouter();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDemoSwitch = async (targetRole: 'TRAVELER' | 'PARTNER' | 'GOVERNMENT') => {
    await loginAsDemo(targetRole);
    setShowRoleDropdown(false);
    if (targetRole === 'PARTNER') {
      router.push('/partner/dashboard');
    } else if (targetRole === 'GOVERNMENT') {
      router.push('/government/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#312E81] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-[#312E81]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                YatraSetu
                {role === 'GOVERNMENT' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                    Gov Portal
                  </span>
                ) : role === 'PARTNER' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                    Partner Portal
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 font-medium">
                    India
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-300 font-light tracking-wide hidden sm:inline">
                Discover • Connect • Grow
              </span>
            </div>
          </Link>

          {/* Dynamic Navigation Links based on Role */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAuthenticated && (
              <>
                <Link
                  href="/explore"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-[#F59E0B]" />
                  Explore
                </Link>
                <Link
                  href="/local"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-[#0F766E]" />
                  YatraSetu Local
                </Link>
                <Link
                  href="/travel-connect"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-[#F59E0B]" />
                  Connect
                </Link>
              </>
            )}

            {isAuthenticated && role === 'TRAVELER' && (
              <>
                <Link
                  href="/explore"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-[#F59E0B]" />
                  Explore
                </Link>
                <Link
                  href="/plan-trip"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  Plan Trip
                </Link>
                <Link
                  href="/local"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4 text-[#0F766E]" />
                  YatraSetu Local
                </Link>
                <Link
                  href="/travel-connect"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-[#F59E0B]" />
                  Connect
                </Link>
              </>
            )}

            {isAuthenticated && role === 'PARTNER' && (
              <>
                <Link
                  href="/partner/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-teal-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4 text-teal-400" />
                  Dashboard
                </Link>
                <Link
                  href="/partner/profile"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                  Partner Profile
                </Link>
              </>
            )}

            {isAuthenticated && role === 'GOVERNMENT' && (
              <>
                <Link
                  href="/government/dashboard"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-amber-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  <Landmark className="w-4 h-4 text-amber-400" />
                  Governance Intelligence
                </Link>
              </>
            )}
          </nav>

          {/* Right Action: Fast Role Switcher & Auth State */}
          <div className="flex items-center gap-3">
            {/* Demo Role Switcher Dropdown (for quick paired demo review) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 border border-white/10 transition-colors"
                title="Switch Stakeholder View"
              >
                <span>Role: <strong>{role || 'Guest'}</strong></span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1E1B4B] border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 font-semibold text-slate-400 border-b border-slate-700">
                    Switch Stakeholder
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('TRAVELER')}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-[#F59E0B]" />
                    Traveler
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('PARTNER')}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-[#0F766E]" />
                    Local Partner
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('GOVERNMENT')}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-white flex items-center gap-2"
                  >
                    <Landmark className="w-4 h-4 text-amber-400" />
                    Government (Official)
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#F59E0B] text-[#171717] hover:bg-[#D97706] transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={role === 'PARTNER' ? '/partner/profile' : '/profile'}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Profile"
                >
                  <UserCircle className="w-5 h-5 text-[#F59E0B]" />
                  <span className="hidden sm:inline">{user?.displayName || user?.fullName?.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
