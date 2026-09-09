'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  MapPin,
  Star,
  Users,
  Award,
  Globe,
  Languages,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Eye,
  Phone,
  Mail,
  Navigation,
  BarChart3,
} from 'lucide-react';

export default function GuideDashboardPage() {
  const router = useRouter();
  const { user, partnerDetails } = useAuth();

  const isVerified = partnerDetails?.verified || false;
  const verificationStatus = (partnerDetails as any)?.dgLockerVerified ? 'VERIFIED' : 'PENDING';

  // Mock guide data
  const guideData = {
    tripsCompleted: 47,
    totalTravelers: 186,
    avgRating: 4.8,
    totalReviews: 142,
    popularCities: ['Hampi', 'Badami', 'Mysore', 'Bangalore'],
    languages: partnerDetails?.languages || ['Kannada', 'English', 'Hindi'],
    specialties: partnerDetails?.partnerSkills || ['Heritage Walks', 'Temple Architecture', 'Photography'],
    monthlyEarnings: '₹45,200',
    thisMonthTrips: 6,
    upcomingTrips: 3,
  };

  const recentTravelers = [
    { id: 1, name: 'Aditi Sharma', from: 'Mumbai', date: 'Sep 5, 2026', trip: 'Hampi Heritage Walk', rating: 5.0, status: 'completed' },
    { id: 2, name: 'Rahul Verma', from: 'Delhi', date: 'Sep 2, 2026', trip: 'Badami Cave Tour', rating: 4.8, status: 'completed' },
    { id: 3, name: 'Maya Patel', from: 'Ahmedabad', date: 'Aug 28, 2026', trip: 'Mysore Palace Walk', rating: 4.9, status: 'completed' },
    { id: 4, name: 'Arjun Kumar', from: 'Chennai', date: 'Aug 25, 2026', trip: 'Hampi Sunrise Tour', rating: 5.0, status: 'completed' },
    { id: 5, name: 'Priya Nair', from: 'Kochi', date: 'Aug 20, 2026', trip: 'Badami Heritage', rating: 4.7, status: 'completed' },
  ];

  const upcomingBookings = [
    { id: 1, traveler: 'Sandeep Joshi', from: 'Pune', date: 'Sep 12, 2026', trip: 'Hampi Full Day', status: 'confirmed' },
    { id: 2, traveler: 'Lisa Chen', from: 'Singapore', date: 'Sep 15, 2026', trip: 'Hampi + Badami 2-Day', status: 'pending' },
    { id: 3, traveler: 'Meera Reddy', from: 'Hyderabad', date: 'Sep 18, 2026', trip: 'Mysore Heritage Walk', status: 'confirmed' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Guide Dashboard
                </h1>
                {isVerified || verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3" />Pending
                  </span>
                )}
              </div>
              <p className="text-teal-200 text-sm">
                {partnerDetails?.fullName || user?.fullName || 'Guide'} • {partnerDetails?.city || 'Hampi, Karnataka'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Verification Pending Banner */}
        {verificationStatus === 'PENDING' && !isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-800">Verification Pending</h3>
              <p className="text-xs text-amber-600 mt-0.5">
                Your guide application is under review. You cannot accept bookings until verification is complete. 
                Expected review time: 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Trips Conducted', value: guideData.tripsCompleted, icon: Navigation, color: 'text-[#0F766E]', bg: 'bg-teal-50' },
            { label: 'Travelers Served', value: guideData.totalTravelers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Avg Rating', value: guideData.avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Reviews', value: guideData.totalReviews, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'This Month', value: `₹${guideData.monthlyEarnings}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Upcoming', value: guideData.upcomingTrips, icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm animate-card-slide-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#171717]">{value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Guide Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0F766E]" /> Guide Profile
            </h3>

            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Popular Cities</p>
              <div className="flex flex-wrap gap-1.5">
                {guideData.popularCities.map(city => (
                  <span key={city} className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F766E] text-[10px] font-bold border border-teal-100">
                    <MapPin className="w-2.5 h-2.5 inline mr-0.5" />{city}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {guideData.languages.map(lang => (
                  <span key={lang} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#312E81] text-[10px] font-bold border border-indigo-100">
                    <Globe className="w-2.5 h-2.5 inline mr-0.5" />{lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Specialties</p>
              <div className="flex flex-wrap gap-1.5">
                {guideData.specialties.map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Bookings
              </h3>
            </div>

            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#115E59] flex items-center justify-center text-white text-xs font-bold">
                      {booking.traveler.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#171717]">{booking.traveler}</p>
                      <p className="text-[10px] text-slate-500">{booking.trip} • {booking.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    booking.status === 'confirmed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Travelers */}
        <div>
          <h3 className="text-sm font-bold text-[#171717] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#312E81]" /> Travelers Worked With
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Traveler</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">From</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Trip</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTravelers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-[#312E81]">
                            {t.name.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-[#171717]">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">{t.from}</td>
                      <td className="px-5 py-3 text-xs text-slate-600">{t.trip}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{t.date}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400" />{t.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
