'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface YatraSetuAIButtonProps {
  isOpen: boolean;
  onClick: () => void;
  destinationName?: string;
  role?: string;
}

export const YatraSetuAIButton: React.FC<YatraSetuAIButtonProps> = ({
  isOpen,
  onClick,
  destinationName,
  role = 'GUEST',
}) => {
  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group">
      {/* Floating Pill Helper (only when closed) */}
      {!isOpen && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-primary/20 shadow-lg rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 animate-in fade-in slide-in-from-right-2 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Ask YatraSetu AI {destinationName ? `about ${destinationName}` : ''}</span>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={onClick}
        aria-label={isOpen ? 'Close YatraSetu AI Assistant' : 'Open YatraSetu AI Assistant'}
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30 ${
          isOpen
            ? 'w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600'
            : 'h-13 px-4 bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:scale-105 active:scale-95 text-white ring-2 ring-white/50 dark:ring-gray-800'
        }`}
      >
        {/* Shimmer / Glow background effect when closed */}
        {!isOpen && (
          <span className="absolute -inset-1 bg-gradient-to-r from-primary to-amber-400 rounded-full blur-xs opacity-50 group-hover:opacity-75 animate-pulse -z-10" />
        )}

        {isOpen ? (
          <X className="w-5 h-5 transition-transform duration-200 rotate-0 group-hover:rotate-90" />
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin-slow" />
            <span className="font-semibold text-sm tracking-wide hidden md:inline">
              Ask AI
            </span>
            {role !== 'GUEST' && (
              <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                {role}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
};
