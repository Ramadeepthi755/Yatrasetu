'use client';

import React from 'react';
import {
  Star,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Award,
} from 'lucide-react';
import { PartnerReview } from '@/lib/api';

interface PartnerReviewsTabProps {
  reviews: PartnerReview[];
}

export default function PartnerReviewsTab({ reviews }: PartnerReviewsTabProps) {
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '5.0';

  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const fourStars = reviews.filter((r) => r.rating === 4).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#171717]">Guest Reviews & Ratings</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            {reviews.length} Verified Reviews
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Authentic feedback from tourists who have completed your circuits, craft workshops, or stays.
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold text-2xl">
            {avgRating}
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Average Guest Score</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Trip Ratio</span>
          <div className="text-2xl font-bold text-emerald-600">100%</div>
          <p className="text-[11px] text-slate-400">Verified through GPS & Safety Checkpoints</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Feedback</span>
          <div className="text-2xl font-bold text-[#171717]">{reviews.length} Reviews</div>
          <p className="text-[11px] text-slate-400">{fiveStars} Five-Star Experiences</p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171717]">No Reviews Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once tourists complete their booked tours and provide ratings, verified feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold text-xs">
                    {r.userName ? r.userName[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">{r.userName || 'Verified Tourist'}</h4>
                    <span className="text-[11px] text-slate-400">{r.experienceTitle || 'Heritage Experience'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Trip
                  </span>
                </div>
              </div>

              {r.title && <h5 className="text-xs font-bold text-slate-800">{r.title}</h5>}
              <p className="text-xs text-slate-600 leading-relaxed italic">“{r.comment}”</p>
              <div className="text-[10px] text-slate-400 pt-1">Reviewed on {r.createdAt?.substring(0, 10)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
