import Link from 'next/link';
import { Compass, Users, Landmark, MapPin, ArrowRight, ShieldCheck, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#312E81] via-[#312E81] to-[#1E1B4B] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-[#F59E0B]">
            <Compass className="w-4 h-4 text-[#F59E0B]" />
            Discover India • Connect Locally • Grow Tourism
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The Connected Tourism Ecosystem for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-[#FCD34D] to-[#F59E0B]">
              India
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-200 leading-relaxed font-light">
            Connecting travelers with authentic local hosts, community guides, and verified experiences, while empowering local economies and delivering actionable tourism intelligence.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/explore"
              className="px-6 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#171717] font-semibold shadow-lg shadow-[#F59E0B]/20 transition-all flex items-center gap-2 group"
            >
              <Compass className="w-5 h-5 text-[#171717]" />
              Explore Destinations
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/local"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium backdrop-blur-md transition-all flex items-center gap-2"
            >
              <MapPin className="w-5 h-5 text-[#0F766E]" />
              Meet Local Hosts
            </Link>
          </div>

          {/* Seed Foundation Badge */}
          <div className="pt-6 text-xs text-slate-300 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>28 States &bull; 138 Cities &bull; 93 Curated Destinations &bull; 743 POIs &bull; 1,007 Hotels</span>
          </div>
        </div>
      </section>

      {/* Three Stakeholder Ecosystem Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#312E81] tracking-tight">
            One Unified Platform. Three Empowered Stakeholders.
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            Moving beyond simple listings into a sustainable and verified tourism lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Traveler Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#312E81]/10 flex items-center justify-center text-[#312E81]">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#171717]">1. Travelers</h3>
              <p className="text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                Discover → Plan → Connect → Book → Review
              </p>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Personalized discovery, AI-grounded itinerary planning, verified stays, authentic local experiences, and safe travel buddy connections.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link href="/plan-trip" className="text-xs font-semibold text-[#312E81] hover:text-[#F59E0B] flex items-center gap-1">
                Try AI Trip Planner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. Local Partner Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#171717]">2. Local Partners</h3>
              <p className="text-xs font-medium text-[#0F766E] uppercase tracking-wider">
                Register → Host → Get Bookings → Earn
              </p>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Direct economic participation for local guides, artisans, home chefs, cultural custodians, and homestay owners with zero middlemen.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link href="/partner" className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1">
                Partner Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Government & Authorities Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#171717]">3. Government</h3>
              <p className="text-xs font-medium text-[#312E81] uppercase tracking-wider">
                Observe → Analyze → Support → Measure Impact
              </p>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Aggregated visitor trends, emerging destination opportunity indices, sentiment clustering, and grassroots economic impact analytics.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link href="/government" className="text-xs font-semibold text-[#312E81] hover:text-[#F59E0B] flex items-center gap-1">
                Governance Intelligence <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Differentiators Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#312E81] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                Core Differentiators
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Empowering People Through Human Connection
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed font-light">
                YatraSetu doesn&apos;t stop at destination information. Our explainable matching engine connects travelers directly with verified local hosts and compatible travel companions, keeping all interactions securely inside YatraSetu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[#F59E0B]">
                  <MapPin className="w-5 h-5" />
                  <h4 className="font-semibold text-white">YatraSetu Local</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Multi-factor explainable matching based on interests, language, proximity, budget, and verified ratings.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[#0F766E]">
                  <Users className="w-5 h-5 text-teal-300" />
                  <h4 className="font-semibold text-white">YatraSetu Connect</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Privacy-first in-app travel companion discovery by circuit, dates, budget compatibility, and travel style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
