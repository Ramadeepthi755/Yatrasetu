import Link from 'next/link';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-slate-300 pt-12 pb-20 md:pb-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#312E81]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">YatraSetu</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              &quot;Discover India. Connect Locally. Grow Tourism.&quot;
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Local Ecosystem</span>
            </div>
          </div>

          {/* Traveler Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Travelers</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/explore" className="hover:text-white transition-colors">Explore India</Link></li>
              <li><Link href="/plan-trip" className="hover:text-white transition-colors">AI Trip Planner</Link></li>
              <li><Link href="/local" className="hover:text-white transition-colors">YatraSetu Local Hosts</Link></li>
              <li><Link href="/travel-connect" className="hover:text-white transition-colors">Travel Connect Buddies</Link></li>
            </ul>
          </div>

          {/* Partner & Community */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Local Partners</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/partner" className="hover:text-white transition-colors">Partner Portal</Link></li>
              <li><Link href="/partner/experiences" className="hover:text-white transition-colors">Host an Experience</Link></li>
              <li><Link href="/partner/verify" className="hover:text-white transition-colors">Get Verified</Link></li>
            </ul>
          </div>

          {/* Government & Data Transparency */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Governance</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/government" className="hover:text-white transition-colors">Tourism Intelligence Portal</Link></li>
              <li><Link href="/government/destinations" className="hover:text-white transition-colors">Emerging Destination Score</Link></li>
              <li><Link href="/government/impact" className="hover:text-white transition-colors">Local Impact Metrics</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} YatraSetu. Built for sustainable, community-first Indian tourism.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for India
          </p>
        </div>
      </div>
    </footer>
  );
}
