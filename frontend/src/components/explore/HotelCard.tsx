'use client';

import React from 'react';
import Link from 'next/link';
import { Bed, Star, MapPin, CheckCircle, IndianRupee, Database, ShieldCheck, Clock } from 'lucide-react';
import { HotelItem } from '@/lib/api';

interface HotelCardProps {
  hotel: HotelItem;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const isPartner = hotel.isPartnerProperty;
  const isVerifiedPartner = isPartner && hotel.verificationStatus === 'VERIFIED';
  const isPendingPartner = isPartner && hotel.verificationStatus === 'PENDING_REVIEW';
  const isLiveApi = hotel.sourceType === 'LIVE_API';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-400">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
              <Bed className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <Link href={`/hotels/${hotel.id}`} className="font-bold text-stone-900 hover:text-indigo-900 transition-colors leading-snug">
                  {hotel.hotelName}
                </Link>
                {isVerifiedPartner ? (
                  <span className="flex items-center rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200" title="YatraSetu Verified Partner Property">
                    <ShieldCheck className="h-3 w-3 mr-0.5 text-teal-600" /> Verified Partner
                  </span>
                ) : isPendingPartner ? (
                  <span className="flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200" title="Partner Property Verification in Progress">
                    <Clock className="h-3 w-3 mr-0.5 text-amber-600" /> In Review
                  </span>
                ) : isPartner ? (
                  <span className="flex items-center rounded-full bg-stone-50 px-1.5 py-0.5 text-[10px] font-bold text-stone-700 border border-stone-200" title="Registered Partner Property">
                    <CheckCircle className="h-3 w-3 mr-0.5 text-stone-500" /> Partner
                  </span>
                ) : isLiveApi ? (
                  <span className="flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200" title="Live Inventory API Feed">
                    <CheckCircle className="h-3 w-3 mr-0.5 text-emerald-600" /> Live API
                  </span>
                ) : (
                  <span className="flex items-center rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200" title="Verified Curated Dataset Record">
                    <Database className="h-2.5 w-2.5 mr-0.5 text-stone-400" /> Dataset
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 flex items-center mt-0.5">
                <MapPin className="h-3 w-3 mr-0.5 text-stone-400" />
                {hotel.cityName || hotel.address || 'India'}
              </p>
            </div>
          </div>
          {hotel.hotelRating && (
            <div className="flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
              {Number(hotel.hotelRating).toFixed(1)}
            </div>
          )}
        </div>

        {/* Category & Amenities */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
            {hotel.category || 'Hotel'}
          </span>
          {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity, idx) => (
            <span
              key={idx}
              className="rounded bg-stone-50 px-2 py-0.5 text-[10px] text-stone-500 border border-stone-100"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
        <div>
          <span className="text-stone-400 text-[10px] block">
            {isPartner ? 'Partner Rate' : isLiveApi ? 'Live Rate' : 'Indicative Rate'}
          </span>
          <p className="text-sm font-bold text-stone-900 flex items-center">
            <IndianRupee className="h-3.5 w-3.5" />
            {Number(hotel.pricePerNight).toLocaleString('en-IN')}
            <span className="text-xs font-normal text-stone-500"> /night</span>
          </p>
        </div>

        <Link
          href={`/hotels/${hotel.id}`}
          className="rounded-lg bg-indigo-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-800 shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
