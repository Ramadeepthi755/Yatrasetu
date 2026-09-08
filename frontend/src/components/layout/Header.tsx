'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Users,
  MapPin,
  Sparkles,
  Bed,
  UserCircle,
  Landmark,
  Briefcase,
  LogOut,
  ShieldCheck,
  ChevronDown,
  User,
  ExternalLink,
} from 'lucide-react';

export default function Header() {
  const { user, role, isAuthenticated, logout, openAuthModal } = useAuth();
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const getStartedRef = useRef<HTMLDivElement>(null);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
      if (getStartedRef.current && !getStartedRef.current.contains(event.target as Node)) {
        setShowGetStarted(false);
      }
    };
    if (showAccountMenu || showGetStarted) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu, showGetStarted]);

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await logout();
    router.push('/');
  };

  const getRoleLabel = () => {
    if (!isAuthenticated || !role) return 'Guest';
    if (role === 'PARTNER') return 'Local Partner (Demo)';
    if (role === 'GOVERNMENT') return 'Government (Demo)';
    return 'Traveler (Demo)';
  };

  const getRoleBadgeColor = () => {
    if (role === 'PARTNER') return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    if (role === 'GOVERNMENT') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
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

          {/* Public & Role Navigation Links with Auth Guards */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Explore India */}
            <Link
              href="/explore"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/login?redirect=/explore');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#F59E0B]" />
              Explore
            </Link>

            {/* Plan Trip */}
            <Link
              href="/plan-trip"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/login?redirect=/plan-trip');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              Plan Trip
            </Link>

            {/* Experiences */}
            <Link
              href="/experiences"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/login?redirect=/experiences');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#F59E0B]" />
              Experiences
            </Link>

            {/* Local People */}
            <Link
              href="/local"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/login?redirect=/local');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-[#0F766E]" />
              Local People
            </Link>

            {/* Hotels */}
            <Link
              href="/hotels"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/login?redirect=/hotels');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Bed className="w-4 h-4 text-indigo-300" />
              Hotels
            </Link>

            {/* Travel Connect */}
            <Link
              href="/travel-connect"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push('/login?redirect=/travel-connect');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-[#F59E0B]" />
              Connect
            </Link>

            {/* Bookings (Authenticated Users) */}
            {isAuthenticated && (
              <Link
                href="/bookings"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-200 hover:text-white hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-4 h-4 text-amber-300" />
                Bookings
              </Link>
            )}

            {/* Dashboard link for Travelers */}
            {isAuthenticated && role === 'TRAVELER' && (
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-indigo-200 hover:text-white hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors flex items-center gap-1.5 ml-1"
              >
                <User className="w-4 h-4 text-indigo-300" />
                Dashboard
              </Link>
            )}

            {/* Partner specific link */}
            {isAuthenticated && role === 'PARTNER' && (
              <Link
                href="/partner/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-teal-200 hover:text-white hover:bg-teal-500/20 border border-teal-500/30 transition-colors flex items-center gap-1.5 ml-1"
              >
                <Briefcase className="w-4 h-4 text-teal-300" />
                Partner Dashboard
              </Link>
            )}

            {/* Government specific link */}
            {isAuthenticated && role === 'GOVERNMENT' && (
              <Link
                href="/government/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-200 hover:text-white hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5 ml-1"
              >
                <Landmark className="w-4 h-4 text-amber-300" />
                Governance Intelligence
              </Link>
            )}
          </nav>

          {/* Right Action: Clean Guest Sign In / Authenticated Account Menu */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              /* GUEST STATE */
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-medium text-slate-200 hover:text-white border border-white/10 transition-all shadow-sm"
                >
                  <UserCircle className="w-4 h-4 text-[#F59E0B]" />
                  <span>Guest • Sign In</span>
                </Link>

                {/* Get Started dropdown */}
                <div className="relative" ref={getStartedRef}>
                  <button
                    onClick={() => setShowGetStarted(!showGetStarted)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#F59E0B] text-[#171717] hover:bg-[#D97706] transition-colors shadow-sm"
                  >
                    Get Started
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showGetStarted ? 'rotate-180' : ''}`} />
                  </button>

                  {showGetStarted && (
                    <div className="absolute right-0 mt-2 w-52 bg-[#1E1B4B] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-scale-up">
                      <p className="px-4 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Join YatraSetu
                      </p>
                      <Link
                        href="/login"
                        onClick={() => setShowGetStarted(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Sign In</div>
                          <div className="text-[10px] text-slate-400">Already have an account</div>
                        </div>
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setShowGetStarted(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#F59E0B]">Sign Up</div>
                          <div className="text-[10px] text-slate-400">Create a new account</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* AUTHENTICATED STATE: Account Profile Menu */
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-colors text-left"
                  aria-expanded={showAccountMenu}
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] text-[#171717] flex items-center justify-center font-bold text-xs shadow">
                    {user?.fullName?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight">
                      {user?.displayName || user?.fullName?.split(' ')[0] || 'My Account'}
                    </span>
                    <span className="text-[10px] text-slate-300 font-light">
                      {getRoleLabel()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
                </button>

                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1E1B4B] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-scale-up">
                    {/* User Identity Card */}
                    <div className="px-4 py-3 border-b border-slate-700/80 bg-white/5 mx-2 rounded-xl mb-1">
                      <div className="font-bold text-sm text-white truncate">
                        {user?.fullName || user?.displayName || 'YatraSetu Member'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {user?.email || 'Authenticated Session'}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                          <ShieldCheck className="w-3 h-3" />
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>

                    {/* Role-Specific Navigation */}
                    <div className="py-1">
                      {role === 'TRAVELER' && (
                        <>
                          <Link
                            href="/bookings"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors font-medium text-amber-300"
                          >
                            <Briefcase className="w-4 h-4 text-amber-400" />
                            <span>My Bookings & Live Trips</span>
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <User className="w-4 h-4 text-[#F59E0B]" />
                            <span>Traveler Profile & Trips</span>
                          </Link>
                          <Link
                            href="/travel-connect"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <Users className="w-4 h-4 text-[#0F766E]" />
                            <span>Travel Connect Buddies</span>
                          </Link>
                          <Link
                            href="/explore"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <Compass className="w-4 h-4 text-indigo-300" />
                            <span>Explore Destinations</span>
                          </Link>
                        </>
                      )}

                      {role === 'PARTNER' && (
                        <>
                          <Link
                            href="/partner/dashboard"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <Briefcase className="w-4 h-4 text-teal-400" />
                            <span>Partner Dashboard</span>
                          </Link>
                          <Link
                            href="/partner/profile"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                            <span>Partner Business Profile</span>
                          </Link>
                          <Link
                            href="/explore"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <Compass className="w-4 h-4 text-slate-400" />
                            <span>Public Portal View</span>
                          </Link>
                        </>
                      )}

                      {role === 'GOVERNMENT' && (
                        <>
                          <Link
                            href="/government/dashboard"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <Landmark className="w-4 h-4 text-amber-400" />
                            <span>Governance Intelligence Hub</span>
                          </Link>
                          <Link
                            href="/explore"
                            onClick={() => setShowAccountMenu(false)}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 text-slate-200 hover:text-white flex items-center gap-2.5 transition-colors"
                          >
                            <Compass className="w-4 h-4 text-slate-400" />
                            <span>Public Tourism Portal</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-slate-700/80 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
