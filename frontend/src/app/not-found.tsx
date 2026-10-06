import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#312E81]/10 text-[#312E81] flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#171717]">Page Not Found</h2>
          <p className="text-sm text-[#64748B]">
            The trail you are looking for does not exist or has moved. Return to the home portal to continue your journey.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#312E81] text-white font-medium text-sm hover:bg-[#1E1B4B] transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
