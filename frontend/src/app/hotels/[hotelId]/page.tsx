'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Bed,
  Star,
  MapPin,
  CheckCircle,
  IndianRupee,
  ArrowLeft,
  Calendar,
  Wifi,
  ShieldCheck,
  AlertCircle,
  Check,
  Building
} from 'lucide-react';
import { getHotelById, HotelItem } from '@/lib/api';
import { MapView, MapMarker } from '@/components/map/MapView';

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params?.hotelId as string;

  const [hotel, setHotel] = useState<HotelItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Booking / inquiry state
  const [nights, setNights] = useState<number>(2);
  const [rooms, setRooms] = useState<number>(1);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (!hotelId) return;

    async function loadHotel() {
      setLoading(true);
      try {
        const res = await getHotelById(hotelId);
        if (res.success && res.data) {
          setHotel(res.data);
        } else {
          setError(res.message || 'Hotel property not found');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load hotel details';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    loadHotel();
  }, [hotelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-16">
        <div className="mx-auto max-w-5xl px-4 animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-stone-200" />
          <div className="h-64 rounded-3xl bg-white border border-stone-200 p-8" />
          <div className="h-48 rounded-3xl bg-white border border-stone-200 p-8" />
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-stone-50 py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-indigo-600 mb-3" />
          <h2 className="text-xl font-bold text-stone-900">Hotel Not Found</h2>
          <p className="mt-2 text-sm text-stone-600">
            {error || 'We could not locate this accommodation listing in our catalog.'}
          </p>
          <Link
            href="/hotels"
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-800 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Hotels Directory
          </Link>
        </div>
      </div>
    );
  }

  const mapMarkers: MapMarker[] =
    hotel.latitude && hotel.longitude
      ? [
          {
            id: hotel.id,
            title: hotel.hotelName,
            subtitle: `${hotel.category || 'Hotel'} · ₹${Number(hotel.pricePerNight).toLocaleString('en-IN')}/night`,
            latitude: Number(hotel.latitude),
            longitude: Number(hotel.longitude),
            type: 'hotel',
          },
        ]
      : [];

  const totalPrice = Number(hotel.pricePerNight) * nights * rooms;

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-stone-200 bg-white py-3">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/hotels"
            className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-indigo-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Hotels & Accommodations
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Main Hotel Header Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-900 border border-indigo-100">
                  {hotel.category || 'Hotel'}
                </span>
                {hotel.isPartnerProperty ? (
                  <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 border border-teal-200">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1 text-teal-600" /> Partner Property
                  </span>
                ) : (
                  <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 border border-stone-200">
                    Dataset Property
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-stone-900">
                {hotel.hotelName}
              </h1>

              <p className="mt-1.5 flex items-center text-xs text-stone-600">
                <MapPin className="h-4 w-4 mr-1 text-stone-400 flex-shrink-0" />
                {hotel.address || hotel.cityName || 'India'}
                {hotel.cityName && hotel.address ? ` · ${hotel.cityName}` : ''}
              </p>

              {hotel.hotelRating && (
                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <span className="flex items-center rounded-md bg-amber-500/10 px-2.5 py-1 font-bold text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                    {Number(hotel.hotelRating).toFixed(1)} / 5.0 Rating
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">Verified Guest Reviews</span>
                </div>
              )}
            </div>

            {/* Price Badge */}
            <div className="flex flex-col sm:items-end border-t sm:border-t-0 border-stone-100 pt-4 sm:pt-0">
              <span className="text-xs text-stone-400">Nightly Rate</span>
              <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                <IndianRupee className="h-5 w-5" />
                {Number(hotel.pricePerNight).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-stone-500 ml-1">/night</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Amenities + Map on left, Reservation on right */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Amenities & Interactive Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Amenities Section */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-indigo-900" />
                Property Amenities & Services
              </h2>

              {hotel.amenities && hotel.amenities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hotel.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-700 border border-stone-100"
                    >
                      <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500">Standard hospitality amenities provided.</p>
              )}
            </div>

            {/* Interactive Leaflet Map Location */}
            {mapMarkers.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-900" />
                  Exact Property Location
                </h2>
                <p className="text-xs text-stone-500 mb-4">
                  {hotel.address || 'Interactive GPS pin centered at property coordinates'}
                </p>

                <MapView
                  markers={mapMarkers}
                  zoom={14}
                  className="h-80 w-full rounded-2xl overflow-hidden border border-stone-200"
                />
              </div>
            )}

            {/* Destination Link */}
            {hotel.destinationId && (
              <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  Located within the <strong className="text-stone-900">{hotel.destinationName}</strong> destination area
                </span>
                <Link
                  href={`/destinations/${hotel.destinationId}`}
                  className="font-bold text-indigo-900 hover:text-indigo-800"
                >
                  Explore Destination Guide →
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Reservation Request Card */}
          <div>
            <div className="sticky top-20 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs text-stone-400">Starting from</span>
                  <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                    <IndianRupee className="h-5 w-5" />
                    {Number(hotel.pricePerNight).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-stone-500 ml-1">/night</span>
                  </div>
                </div>
                {hotel.isPartnerProperty ? (
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    Partner Direct
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                    Dataset Property
                  </span>
                )}
              </div>

              {bookingConfirmed ? (
                <div className="my-6 rounded-2xl bg-teal-50 border border-teal-200 p-5 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-teal-600 mb-2" />
                  <h4 className="text-sm font-bold text-teal-900">Inquiry Sent to Hotelier!</h4>
                  <p className="mt-1 text-xs text-teal-700">
                    Reservation request for {rooms} room(s) for {nights} night(s) has been forwarded to {hotel.hotelName}.
                  </p>
                  <button
                    onClick={() => setBookingConfirmed(false)}
                    className="mt-4 text-xs font-semibold text-teal-900 underline"
                  >
                    Modify inquiry dates
                  </button>
                </div>
              ) : (
                <div className="my-6 space-y-4 text-xs">
                  {/* Nights selector */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Number of Nights</label>
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-2">
                      <span className="font-semibold text-stone-800">{nights} Night{nights > 1 ? 's' : ''}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setNights((n) => Math.max(1, n - 1))}
                          className="h-7 w-7 rounded-lg bg-white border border-stone-200 font-bold text-stone-700 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setNights((n) => n + 1)}
                          className="h-7 w-7 rounded-lg bg-white border border-stone-200 font-bold text-stone-700 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rooms selector */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Number of Rooms</label>
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-2">
                      <span className="font-semibold text-stone-800">{rooms} Room{rooms > 1 ? 's' : ''}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setRooms((r) => Math.max(1, r - 1))}
                          className="h-7 w-7 rounded-lg bg-white border border-stone-200 font-bold text-stone-700 hover:bg-stone-100"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setRooms((r) => r + 1)}
                          className="h-7 w-7 rounded-lg bg-white border border-stone-200 font-bold text-stone-700 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total price calculation */}
                  <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-100 space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>₹{Number(hotel.pricePerNight).toLocaleString('en-IN')} × {nights} nights × {rooms} room</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                      <span>Estimated Total</span>
                      <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="w-full rounded-xl bg-indigo-900 py-3 text-xs font-bold text-white transition-colors hover:bg-indigo-800 shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Check Availability & Rates</span>
                  </button>

                  <p className="text-[10px] text-center text-stone-400">
                    Direct partner inquiry. No upfront deposit required on inquiry.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
