'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AadhaarVerification from '@/components/auth/AadhaarVerification';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Utensils,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plane,
  Hotel,
  Map,
  TrendingUp,
  Heart,
  Globe,
  Award,
  Navigation,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export default function TravelerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUserVerification } = useAuth();
  const [showAadhaarVerification, setShowAadhaarVerification] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  const isAadhaarVerified = (user as any).aadhaarVerified;

  // Mock data for the dashboard
  const tripsCompleted = 3;
  const upcomingTrips = 1;
  const currentCity = user.city || 'Bengaluru';
  const memberSince = 'Sept 2024';

  const recentTrips = [
    { id: 1, destination: 'Hampi, Karnataka', date: 'Aug 15-18, 2026', status: 'completed', rating: 4.8, guide: 'Rajesh K.' },
    { id: 2, destination: 'Jaipur, Rajasthan', date: 'Jul 1-5, 2026', status: 'completed', rating: 4.5, guide: 'Priya M.' },
    { id: 3, destination: 'Munnar, Kerala', date: 'Jun 10-13, 2026', status: 'completed', rating: 4.9, guide: 'Arun S.' },
  ];

  const quickActions = [
    { label: 'Plan a Trip', desc: 'AI-powered trip planning', icon: Map, href: '/plan-trip', color: 'bg-indigo-50 text-[#312E81]', iconBg: 'bg-indigo-100' },
    { label: 'Book a Guide', desc: 'Find verified local guides', icon: Users, href: '/local', color: 'bg-teal-50 text-[#0F766E]', iconBg: 'bg-teal-100' },
    { label: 'Book Restaurant', desc: 'Authentic cuisine near you', icon: Utensils, href: '/explore?category=food', color: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-100' },
    { label: 'Explore Destinations', desc: 'Discover hidden gems', icon: Compass, href: '/explore', color: 'bg-rose-50 text-rose-600', iconBg: 'bg-rose-100' },
    { label: 'Book Hotels', desc: 'Verified stays across India', icon: Hotel, href: '/hotels', color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
    { label: 'Travel Connect', desc: 'Find travel buddies', icon: Heart, href: '/travel-connect', color: 'bg-pink-50 text-pink-600', iconBg: 'bg-pink-100' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#312E81] via-[#312E81] to-[#1E1B4B] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Namaste, {user.fullName?.split(' ')[0] || 'Traveler'}! 🙏
                </h1>
                {isAadhaarVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />Verified
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                {currentCity} • Member since {memberSince}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/plan-trip"
                className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#171717] text-sm font-semibold shadow-lg shadow-[#F59E0B]/20 transition-all flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Plan New Trip
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Aadhaar Verification Banner */}
        {!isAadhaarVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-800">Complete Your Verification</h3>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Verify your Aadhaar to unlock full platform features — book guides, hotels, and get verified traveler badge.
                  </p>
                </div>
                {!showAadhaarVerification ? (
                  <button
                    onClick={() => setShowAadhaarVerification(true)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Aadhaar Now
                  </button>
                ) : (
                  <AadhaarVerification
                    onVerified={(data) => {
                      setUserVerification({
                        aadhaarVerified: data.verified,
                        aadhaarNumber: data.aadhaarNumber,
                        dgLockerConnected: data.method === 'digilocker',
                      });
                      setShowAadhaarVerification(false);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Trips Completed', value: tripsCompleted, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Upcoming', value: upcomingTrips, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Cities Visited', value: 5, icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Avg Rating Given', value: '4.7', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm animate-card-slide-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[#171717]">{value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-[#171717] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(({ label, desc, icon: Icon, href, iconBg }, i) => (
              <Link
                key={label}
                href={href}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md transition-all group animate-card-slide-in"
                style={{ animationDelay: `${0.4 + i * 0.08}s` }}
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-[#171717]">{label}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Trips */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-[#171717]">Recent Trips</h2>
            <Link href="/trips" className="text-xs font-semibold text-[#312E81] hover:text-[#F59E0B] flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTrips.map((trip, i) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md transition-all animate-card-slide-in flex items-center justify-between"
                style={{ animationDelay: `${0.8 + i * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#312E81] to-[#4338CA] flex items-center justify-center text-white">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">{trip.destination}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{trip.date}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />{trip.guide}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-sm font-bold">{trip.rating}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    {trip.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#312E81] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171717]">AI Recommended for You</h3>
              <p className="text-xs text-slate-500">Based on your travel preferences</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: 'Mysore Palace Walk', type: 'Heritage Tour', location: 'Mysore, Karnataka', rating: '4.9' },
              { name: 'Backwater Houseboat', type: 'Nature Experience', location: 'Alleppey, Kerala', rating: '4.8' },
              { name: 'Pushkar Camel Fair', type: 'Cultural Festival', location: 'Pushkar, Rajasthan', rating: '4.7' },
            ].map((exp) => (
              <div key={exp.name} className="bg-white rounded-xl p-4 border border-indigo-100 hover:shadow-sm transition-all">
                <h4 className="text-xs font-bold text-[#171717]">{exp.name}</h4>
                <p className="text-[10px] text-[#312E81] font-semibold mt-0.5">{exp.type}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{exp.location}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />{exp.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
