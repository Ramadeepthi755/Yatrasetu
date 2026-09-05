'use client';

import React from 'react';
import Link from 'next/link';
import { Store, UserPlus, ShieldAlert, ArrowRight } from 'lucide-react';

export interface EcosystemEmptyStateProps {
  title: string;
  category: string;
  destinationName?: string;
  description?: string;
  showPartnerCta?: boolean;
}

export function EcosystemEmptyState({
  title,
  category,
  destinationName,
  description,
  showPartnerCta = true,
}: EcosystemEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-8 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3">
        <Store className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h4>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        {description ||
          `We do not fabricate fake listings or prices. Verified ${category.toLowerCase()} listings for ${destinationName || 'this destination'} will appear as local providers register.`}
      </p>

      {showPartnerCta && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/partner/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register as {category} Partner</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
