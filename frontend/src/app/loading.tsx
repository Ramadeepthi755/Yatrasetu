import { Compass } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#312E81] flex items-center justify-center animate-pulse">
          <Compass className="w-6 h-6 text-[#F59E0B] animate-spin" />
        </div>
        <p className="text-xs font-medium text-[#64748B] tracking-wide">
          Connecting to YatraSetu...
        </p>
      </div>
    </div>
  );
}
