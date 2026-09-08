'use client';

import React from 'react';
import { Database, ShieldCheck, Activity, CheckCircle2, User, Users, AlertTriangle } from 'lucide-react';

export interface ProvenanceBadgeProps {
  sourceType?: string;
  sourceLabel?: string;
  isVerified?: boolean;
  className?: string;
}

export function ProvenanceBadge({
  sourceType,
  sourceLabel,
  isVerified = false,
  className = '',
}: ProvenanceBadgeProps) {
  // Normalize source type
  const type = (sourceType || 'DATASET').toUpperCase();

  // Determine display label strictly following rules:
  // PARTNER_SUBMITTED must NOT automatically mean VERIFIED.
  // Only display 'Verified Partner' when isVerified is explicitly true.
  let label = sourceLabel;
  let icon = <Database className="w-3 h-3 text-blue-500" />;
  let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';

  if (type === 'OFFICIAL') {
    label = 'Official';
    icon = <ShieldCheck className="w-3 h-3 text-purple-500" />;
    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60';
  } else if (type === 'API') {
    label = 'Live API';
    icon = <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />;
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
  } else if (type === 'PARTNER_SUBMITTED') {
    if (isVerified) {
      label = 'Verified Partner';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    } else {
      label = 'Partner Listing';
      icon = <User className="w-3 h-3 text-slate-500" />;
      badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700';
    }
  } else if (type === 'USER_GENERATED') {
    label = 'Traveler Submitted';
    icon = <Users className="w-3 h-3 text-cyan-600" />;
    badgeStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60';
  } else if (type === 'DEMO') {
    label = 'Demo';
    icon = <AlertTriangle className="w-3 h-3 text-amber-500" />;
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
  } else {
    // Default DATASET
    label = label || 'Dataset';
    icon = <Database className="w-3 h-3 text-blue-500" />;
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
      title={`Data Provenance: ${label}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
