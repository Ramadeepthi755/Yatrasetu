'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Compass, Sparkles, Users, User, Briefcase, Landmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileNav() {
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleProtectedClick = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#312E81] border-t border-[#312E81]/20 px-3 py-2 shadow-2xl backdrop-blur-lg bg-opacity-95"
    >
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link
          href="/explore"
          onClick={(e) => handleProtectedClick(e, '/explore')}
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Compass className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-[10px] mt-1 font-medium">Explore</span>
        </Link>
        <Link
          href="/plan-trip"
          onClick={(e) => handleProtectedClick(e, '/plan-trip')}
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-[10px] mt-1 font-medium">Plan</span>
        </Link>
        <Link
          href="/travel-connect"
          onClick={(e) => handleProtectedClick(e, '/travel-connect')}
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Users className="w-5 h-5 text-[#0F766E]" />
          <span className="text-[10px] mt-1 font-medium">Connect</span>
        </Link>

        {/* Dynamic Profile / Portal / Sign In */}
        {!isAuthenticated ? (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center text-amber-300 hover:text-amber-200 py-1 px-2 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Sign In</span>
          </Link>
        ) : role === 'PARTNER' ? (
          <Link
            href="/partner/dashboard"
            className="flex flex-col items-center justify-center text-teal-300 hover:text-teal-200 py-1 px-2 rounded-lg transition-colors"
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Partner</span>
          </Link>
        ) : role === 'GOVERNMENT' ? (
          <Link
            href="/government/dashboard"
            className="flex flex-col items-center justify-center text-rose-300 hover:text-rose-200 py-1 px-2 rounded-lg transition-colors"
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Gov Hub</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">Profile</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
