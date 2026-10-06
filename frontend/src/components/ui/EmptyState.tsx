import React from 'react';
import { Compass, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
}

export function EmptyState({
  title = 'No destinations found',
  description = 'Try changing your search keywords, region filters, or travel categories.',
  onReset,
  resetText = 'Clear Filters',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-4">
        <Compass className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-stone-500 leading-relaxed">
        {description}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-5 inline-flex items-center space-x-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{resetText}</span>
        </button>
      )}
    </div>
  );
}
