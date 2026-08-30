import Link from 'next/link';
import { Compass, Users, MapPin, Sparkles, UserCircle } from 'lucide-react';

export default function Header() {
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 font-medium">
                  India
                </span>
              </span>
              <span className="text-[11px] text-slate-300 font-light tracking-wide hidden sm:inline">
                Discover • Connect • Grow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
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
          </nav>

          {/* Right Action / Stakeholder Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 border-r border-white/20 pr-4">
              <span className="px-2 py-0.5 rounded bg-white/10">Traveler</span>
              <span className="px-2 py-0.5 rounded bg-white/10">Partner</span>
              <span className="px-2 py-0.5 rounded bg-white/10">Government</span>
            </div>
            <Link
              href="/profile"
              className="p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="User Profile"
            >
              <UserCircle className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
