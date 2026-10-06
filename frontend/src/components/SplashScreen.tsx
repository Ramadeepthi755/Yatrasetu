'use client';

import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Mountain, Palmtree } from 'lucide-react';

export default function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=tagline, 2=particles, 3=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2600);
    const t4 = setTimeout(() => onFinished(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F766E] transition-opacity duration-500 ${
        phase >= 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated dotted background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px] animate-[bgScroll_20s_linear_infinite]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[MapPin, Mountain, Palmtree, Compass, MapPin, Mountain].map((Icon, i) => (
          <div
            key={i}
            className="absolute text-white/10 animate-[floatUp_4s_ease-in-out_infinite]"
            style={{
              left: `${15 + i * 14}%`,
              bottom: '-40px',
              animationDelay: `${i * 0.6}s`,
            }}
          >
            <Icon className="w-6 h-6" />
          </div>
        ))}
      </div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#F59E0B]/15 blur-[100px] animate-pulse" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Logo icon with spin-in */}
        <div
          className={`relative transition-all duration-700 ease-out ${
            phase >= 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-2xl shadow-[#F59E0B]/30 animate-[logoPulse_2s_ease-in-out_infinite]">
            <Compass className="w-10 h-10 text-[#312E81] animate-[compassSpin_3s_ease-in-out_infinite]" />
          </div>
          {/* Ring animation */}
          <div className="absolute inset-0 rounded-2xl border-2 border-[#F59E0B]/30 animate-ping" />
        </div>

        {/* Brand name */}
        <div
          className={`transition-all duration-600 delay-200 ${
            phase >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Yatra<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]">Setu</span>
          </h1>
        </div>

        {/* Tagline */}
        <div
          className={`transition-all duration-600 ${
            phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <p className="text-sm sm:text-base text-slate-300 font-light tracking-wide">
            Discover India • Connect Locally • Grow Tourism
          </p>
        </div>

        {/* Loader bar */}
        <div
          className={`transition-all duration-500 ${
            phase >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-[1500ms] ease-out"
              style={{ width: phase >= 2 ? '100%' : '30%' }}
            />
          </div>
        </div>

        {/* Stats ticker */}
        <div
          className={`flex items-center gap-6 transition-all duration-500 ${
            phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {[
            { val: '28', label: 'States' },
            { val: '138', label: 'Cities' },
            { val: '1007', label: 'Hotels' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-extrabold text-[#F59E0B]">{val}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
