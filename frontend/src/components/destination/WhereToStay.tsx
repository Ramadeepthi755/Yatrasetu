'use client';

import React from 'react';
import Link from 'next/link';
import { Bed, ShieldCheck, Star, ArrowRight, Building2 } from 'lucide-react';
import { HotelItem, DestinationDetail } from '@/lib/api';

interface WhereToStayProps {
  destination: DestinationDetail;
  hotels?: HotelItem[];
}

export function WhereToStay({ destination, hotels = [] }: WhereToStayProps) {
  const displayHotels = hotels.slice(0, 3);
  const hasMore = hotels.length > 3;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-5 md:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base md:text-lg font-bold text-stone-900 flex items-center gap-2">
          <Bed className="h-4.5 w-4.5 text-indigo-900" />
          <span>Where to Stay</span>
        </h2>

        {hasMore ? (
          <Link
            href={`/hotels?destinationId=${encodeURIComponent(destination.id)}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-900 hover:underline"
          >
            <span>View All Stays</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <Link
            href="/hotels"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800"
          >
            <span>All Stays</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Content */}
      {displayHotels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-5 text-center">
          <Building2 className="h-6 w-6 text-stone-400 mb-1.5" />
          <h4 className="text-xs font-bold text-stone-800">
            No partner stays currently listed
          </h4>
          <p className="text-[11px] text-stone-500 max-w-xs mt-1">
            Local homestays and verified eco-lodges are currently being onboarded for {destination.destinationName}.
          </p>
          <Link
            href="/hotels"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:underline"
          >
            <span>Explore regional hotels</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
          {displayHotels.map((hotel) => {
            const rating = hotel.hotelRating ? hotel.hotelRating.toFixed(1) : '4.5';
            const price = hotel.pricePerNight ? `₹${hotel.pricePerNight.toLocaleString()}` : '₹2,500';
            const propertyType = hotel.category || 'Resort';
            const city = hotel.cityName || destination.destinationName;

            return (
              <div
                key={hotel.id}
                className="group flex flex-col rounded-2xl border border-stone-200/80 bg-stone-50/50 p-3 hover:shadow-md hover:border-indigo-300 transition-all duration-200 justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-stone-900 truncate group-hover:text-indigo-900 transition-colors">
                    {hotel.hotelName}
                  </h3>

                  <div className="flex items-center gap-1 text-[10px] text-teal-700 font-semibold mt-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Partner</span>
                  </div>

                  <p className="text-[10px] text-stone-500 truncate mt-1">
                    {propertyType} • {city}
                  </p>
                </div>

                <div className="pt-2 mt-3 border-t border-stone-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-[11px] font-bold text-stone-800">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{rating}</span>
                  </div>

                  <span className="text-[11px] font-bold text-stone-900">
                    {price} <span className="text-[9px] font-normal text-stone-400">/ night</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
