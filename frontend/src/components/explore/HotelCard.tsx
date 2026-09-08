'use client';

import React from 'react';
import Link from 'next/link';
import { Bed, Star, MapPin, IndianRupee, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-indigo-300 group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-900 group-hover:bg-indigo-950 group-hover:text-white transition-colors">
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <Link
                  href={`/hotels/${hotel.id}`}
                  className="font-bold text-stone-900 hover:text-indigo-900 transition-colors text-base leading-snug"
                >
                  {hotel.hotelName}
                </Link>
                {isVerifiedPartner ? (
                  <span
                    className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200"
                    title="YatraSetu Verified Partner Property"
                  >
                    <ShieldCheck className="h-3 w-3 mr-0.5 text-teal-600" />
                    Verified Partner
                  </span>
                ) : isPendingPartner ? (
                  <span
                    className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200"
                    title="Partner Property Verification in Progress"
                  >
                    <Clock className="h-3 w-3 mr-0.5 text-amber-600" />
                    In Review
                  </span>
                ) : isPartner ? (
                  <span
                    className="inline-flex items-center rounded-full bg-stone-50 px-2 py-0.5 text-[10px] font-bold text-stone-700 border border-stone-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-0.5 text-stone-500" />
                    Registered Stay
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center rounded-full bg-indigo-50/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-900 border border-indigo-100"
                  >
                    Curated Heritage
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 flex items-center mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1 text-stone-400" />
                {hotel.cityName || hotel.address || 'India'}
              </p>
            </div>
          </div>
          {hotel.hotelRating && (
            <div className="flex items-center rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-500/20">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
              {Number(hotel.hotelRating).toFixed(1)}
            </div>
          )}
        </div>

        {/* Category & Amenities */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="rounded-xl bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
            {hotel.category || 'Hotel'}
          </span>
          {hotel.amenities &&
            hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="rounded-xl bg-stone-50 px-2 py-0.5 text-[10px] text-stone-600 border border-stone-200/70"
              >
                {amenity}
              </span>
            ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3.5 text-xs">
        <div>
          <span className="text-stone-400 text-[10px] uppercase font-semibold tracking-wider block">
            {isPartner ? 'Partner Direct Rate' : isLiveApi ? 'Live Channel Rate' : 'Verified Indicative Rate'}
          </span>
          <p className="text-base font-extrabold text-stone-900 flex items-center mt-0.5">
            <IndianRupee className="h-4 w-4 text-stone-700" />
            {Number(hotel.pricePerNight).toLocaleString('en-IN')}
            <span className="text-xs font-normal text-stone-500 ml-1">/ night</span>
          </p>
        </div>

        <Link
          href={`/hotels/${hotel.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-950 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-900 shadow-2xs"
        >
          <span>View Stays</span>
          <ArrowRight className="w-3 h-3 text-amber-400" />
        </Link>
      </div>
    </div>
  );
}
