import Link from 'next/link';
import { Home, Compass, Sparkles, Users, User } from 'lucide-react';

export default function MobileNav() {
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
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Compass className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-[10px] mt-1 font-medium">Explore</span>
        </Link>
        <Link
          href="/plan-trip"
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-[10px] mt-1 font-medium">Plan</span>
        </Link>
        <Link
          href="/travel-connect"
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <Users className="w-5 h-5 text-[#0F766E]" />
          <span className="text-[10px] mt-1 font-medium">Connect</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center text-slate-300 hover:text-white py-1 px-2 rounded-lg transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
