'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ShieldCheck,
  AlertCircle,
  Check,
  Database,
  Info,
  Phone,
  Globe,
  Tag,
  Utensils,
  BedDouble,
  Users,
  Maximize2,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getHotelById,
  getPublicHotelRooms,
  getPublicHotelRatePlans,
  getHotelAvailability,
  HotelItem,
  HotelRoomTypeItem,
  HotelRatePlanItem,
  HotelAvailabilityDto,
  HotelAvailabilityStatus,
} from '@/lib/api';
import { MapView, MapMarker } from '@/components/map/MapView';

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params?.hotelId as string;

  const [hotel, setHotel] = useState<HotelItem | null>(null);
  const [roomsList, setRoomsList] = useState<HotelRoomTypeItem[]>([]);
  const [ratePlansList, setRatePlansList] = useState<HotelRatePlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Availability query state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState<string>(formatDate(tomorrow));
  const [checkOutDate, setCheckOutDate] = useState<string>(formatDate(dayAfterTomorrow));
  const [guestCount, setGuestCount] = useState<number>(2);

  const [availabilityData, setAvailabilityData] = useState<HotelAvailabilityDto | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [expandedNightlyRoomId, setExpandedNightlyRoomId] = useState<string | null>(null);

  // Inquiry form state
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);

  const fetchAvailability = useCallback(async () => {
    if (!hotelId || !checkInDate || !checkOutDate) return;
    if (checkInDate >= checkOutDate) {
      setAvailabilityError('Check-out date must be strictly after check-in date.');
      return;
    }
    setLoadingAvailability(true);
    setAvailabilityError(null);

    try {
      const res = await getHotelAvailability(hotelId, {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
      });
      if (res.success && res.data) {
        setAvailabilityData(res.data);
      } else {
        setAvailabilityError(res.message || 'Unable to retrieve availability data');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to query availability';
      setAvailabilityError(errorMsg);
    } finally {
      setLoadingAvailability(false);
    }
  }, [hotelId, checkInDate, checkOutDate, guestCount]);

  useEffect(() => {
    if (!hotelId) return;

    async function loadHotel() {
      setLoading(true);
      try {
        const [hotelRes, roomsRes, ratePlansRes] = await Promise.all([
          getHotelById(hotelId),
          getPublicHotelRooms(hotelId).catch(() => ({ success: true, data: [] })),
          getPublicHotelRatePlans(hotelId).catch(() => ({ success: true, data: [] })),
        ]);

        if (hotelRes.success && hotelRes.data) {
          setHotel(hotelRes.data);
          setRoomsList(roomsRes.data || []);
          setRatePlansList(ratePlansRes.data || []);
        } else {
          setError(hotelRes.message || 'Hotel property not found');
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

  // Load availability once hotel metadata is ready
  useEffect(() => {
    if (hotel) {
      fetchAvailability();
    }
  }, [hotel, fetchAvailability]);

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

  const isPartner = hotel.isPartnerProperty;
  const isLiveApi = hotel.sourceType === 'LIVE_API';

  const mapMarkers: MapMarker[] =
    hotel.latitude && hotel.longitude
      ? [
          {
            id: hotel.id,
            title: hotel.hotelName,
            subtitle: `${hotel.category || 'Hotel'} · ₹${Number(hotel.pricePerNight).toLocaleString('en-IN')}/night (Indicative)`,
            latitude: Number(hotel.latitude),
            longitude: Number(hotel.longitude),
            type: 'hotel',
          },
        ]
      : [];

  const stayNights = availabilityData?.nights || Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)));
  const estimatedTotal = Number(hotel.pricePerNight) * stayNights;

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
                {isPartner ? (
                  <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 border border-teal-200">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1 text-teal-600" /> Partner Property
                  </span>
                ) : isLiveApi ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Live Inventory API
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 border border-stone-200">
                    <Database className="h-3 w-3 mr-1 text-stone-400" /> Dataset Property
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
                {hotel.stateName ? `, ${hotel.stateName}` : ''}
              </p>

              {hotel.hotelRating && (
                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <span className="flex items-center rounded-md bg-amber-500/10 px-2.5 py-1 font-bold text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-1" />
                    {Number(hotel.hotelRating).toFixed(1)} / 5.0 Baseline Rating
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">Source: Curated Travel Dataset</span>
                </div>
              )}
            </div>

            {/* Price Badge */}
            <div className="flex flex-col sm:items-end border-t sm:border-t-0 border-stone-100 pt-4 sm:pt-0">
              <span className="text-xs text-stone-400">
                {isPartner ? 'Partner Rate' : isLiveApi ? 'Live Nightly Rate' : 'Indicative Rate (Dataset)'}
              </span>
              <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                <IndianRupee className="h-5 w-5" />
                {Number(hotel.pricePerNight).toLocaleString('en-IN')}
                <span className="text-xs font-normal text-stone-500 ml-1">/night</span>
              </div>
            </div>
          </div>
        </div>        {/* 2-Column Layout: Amenities + Map on left, Reservation/Inquiry on right */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Availability Search & Room Types & Interactive Map */}
          <div className="lg:col-span-2 space-y-8">

            {/* Date-Specific Availability Bar */}
            <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-900" />
                    <span>Real-Time Stay Availability</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Select your stay dates to check physical room capacity and date overrides.
                  </p>
                </div>
                {availabilityData && (
                  <div className="flex items-center gap-2">
                    {availabilityData.status === 'AVAILABLE' && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> Available for Stay
                      </span>
                    )}
                    {availabilityData.status === 'LIMITED' && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-amber-600" /> Limited Capacity
                      </span>
                    )}
                    {availabilityData.status === 'SOLD_OUT' && (
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 border border-rose-200">
                        <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-rose-600" /> Sold Out on Dates
                      </span>
                    )}
                    {availabilityData.status === 'UNAVAILABLE_DATA' && (
                      <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 border border-stone-200">
                        <Database className="h-3.5 w-3.5 mr-1.5 text-stone-500" /> Dataset Catalog
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Date Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Guests</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={fetchAvailability}
                      disabled={loadingAvailability}
                      className="rounded-xl bg-indigo-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-800 disabled:opacity-50 flex-shrink-0"
                    >
                      {loadingAvailability ? 'Checking...' : 'Check'}
                    </button>
                  </div>
                </div>
              </div>

              {availabilityError && (
                <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{availabilityError}</span>
                </div>
              )}

              {availabilityData?.note && (
                <div className="mt-3 rounded-xl bg-stone-50 border border-stone-200/80 p-2.5 text-xs text-stone-600 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>{availabilityData.note}</span>
                </div>
              )}
            </div>

            {/* Room Types & Physical Inventory Section */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center">
                  <BedDouble className="h-5 w-5 mr-2 text-indigo-900" />
                  Room Configurations & Live Availability
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  {roomsList.length} {roomsList.length === 1 ? 'Room Configuration' : 'Room Configurations'}
                </span>
              </div>

              {roomsList.length > 0 ? (
                <div className="space-y-5">
                  {roomsList.map((room) => {
                    const availRoom = availabilityData?.rooms?.find((r) => r.roomTypeId === room.id);
                    const roomRatePlans = ratePlansList.filter((p) => p.roomTypeId === room.id);

                    return (
                      <div
                        key={room.id}
                        className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5 transition hover:border-indigo-200 hover:bg-white"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-stone-900">{room.roomTypeName}</h3>
                              {room.isAccessible && (
                                <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                                  Accessible
                                </span>
                              )}
                              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 border border-stone-200">
                                {room.sourceType === 'PARTNER_SUBMITTED' ? 'Partner Listed' : room.sourceType}
                              </span>
                            </div>
                            {room.description && (
                              <p className="mt-1 text-xs text-stone-600 leading-relaxed">{room.description}</p>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-end gap-1.5 flex-shrink-0">
                            {availRoom ? (
                              <>
                                {availRoom.status === 'AVAILABLE' && (
                                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                    {availRoom.availableUnits} {availRoom.availableUnits === 1 ? 'Unit' : 'Units'} Available
                                  </span>
                                )}
                                {availRoom.status === 'LIMITED' && (
                                  <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                                    Only {availRoom.availableUnits} {availRoom.availableUnits === 1 ? 'Unit' : 'Units'} Left
                                  </span>
                                )}
                                {availRoom.status === 'SOLD_OUT' && (
                                  <span className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 border border-rose-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                                    Sold Out on Selected Dates
                                  </span>
                                )}
                                {availRoom.status === 'UNAVAILABLE_DATA' && (
                                  <span className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 border border-stone-200">
                                    Data Unavailable
                                  </span>
                                )}
                                <span className="text-[10px] text-stone-400">
                                  Physical Base: {room.baseInventoryUnits} units
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-900 border border-indigo-100">
                                  Capacity: {room.baseInventoryUnits} {room.baseInventoryUnits === 1 ? 'Unit' : 'Units'}
                                </span>
                                <span className="text-[10px] text-stone-400">Total physical capacity</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-stone-600 border-t border-stone-200/60 pt-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-stone-400" />
                            <span>Max {room.maxOccupancy} {room.maxOccupancy === 1 ? 'Guest' : 'Guests'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BedDouble className="h-3.5 w-3.5 text-stone-400" />
                            <span>{room.bedConfiguration || 'Bed config not specified'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="h-3.5 w-3.5 text-stone-400" />
                            <span>{room.roomSizeSqft ? `${room.roomSizeSqft} sq ft` : 'Size not provided'}</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {room.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Nightly Capacity Breakdown Toggle */}
                        {availRoom && availRoom.nightly && availRoom.nightly.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-stone-200/60">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedNightlyRoomId(
                                  expandedNightlyRoomId === room.id ? null : room.id
                                )
                              }
                              className="text-xs font-bold text-indigo-900 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>
                                {expandedNightlyRoomId === room.id
                                  ? 'Hide Nightly Capacity Details'
                                  : `View Nightly Capacity Breakdown (${availRoom.nightly.length} Nights)`}
                              </span>
                              {expandedNightlyRoomId === room.id ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {expandedNightlyRoomId === room.id && (
                              <div className="mt-2.5 rounded-xl border border-stone-200 bg-white p-3 space-y-2">
                                <div className="grid grid-cols-4 gap-2 text-[11px] font-bold text-stone-500 border-b border-stone-100 pb-1.5">
                                  <span>Night Date</span>
                                  <span className="text-center">Total Capacity</span>
                                  <span className="text-center">Blocked / Maint.</span>
                                  <span className="text-right">Available</span>
                                </div>
                                {availRoom.nightly.map((night, nIdx) => (
                                  <div
                                    key={nIdx}
                                    className="grid grid-cols-4 gap-2 text-xs py-1 items-center border-b border-stone-50 last:border-0"
                                  >
                                    <div className="font-semibold text-stone-800 flex items-center gap-1">
                                      <span>{new Date(night.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                      {night.isDateOverride && (
                                        <span className="rounded bg-indigo-50 text-[9px] font-bold text-indigo-800 px-1 py-0.2 border border-indigo-100">
                                          Date Override
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-center text-stone-600">{night.totalUnits}</span>
                                    <span className="text-center text-amber-700">{night.blockedUnits}</span>
                                    <span
                                      className={`text-right font-bold ${
                                        night.availableUnits > 0 ? 'text-emerald-700' : 'text-rose-600'
                                      }`}
                                    >
                                      {night.availableUnits > 0 ? `${night.availableUnits} units` : '0 (Sold Out)'}
                                    </span>
                                  </div>
                                ))}
                                <div className="text-[10px] text-stone-400 pt-1 italic">
                                  * Overall availability across entire stay is the minimum available capacity ({availRoom.availableUnits} units). Checkout date is excluded from evaluation.
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Configured Rate Plans */}
                        <div className="mt-4 pt-4 border-t border-stone-200/80">
                          <div className="flex items-center justify-between mb-2.5">
                            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Tariff & Rate Plans</span>
                            </h4>
                            <span className="text-[11px] text-stone-500">
                              {roomRatePlans.length} {roomRatePlans.length === 1 ? 'Rate Option' : 'Rate Options'}
                            </span>
                          </div>

                          {roomRatePlans.length > 0 ? (
                            <div className="space-y-2">
                              {roomRatePlans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:bg-emerald-50/70"
                                >
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-bold text-stone-900 text-xs">{plan.planName}</span>
                                      <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-950 border border-amber-200 flex items-center gap-1">
                                        <Utensils className="w-2.5 h-2.5" />
                                        <span>
                                          {plan.mealPlan} ·{' '}
                                          {plan.mealPlan === 'EP'
                                            ? 'Room Only'
                                            : plan.mealPlan === 'CP'
                                            ? 'Breakfast Included'
                                            : plan.mealPlan === 'MAP'
                                            ? 'Breakfast + 1 Meal'
                                            : 'All Meals Included'}
                                        </span>
                                      </span>
                                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                                        Partner-Submitted Rate
                                      </span>
                                    </div>

                                    {plan.description && (
                                      <p className="mt-1 text-[11px] text-stone-600 leading-normal">{plan.description}</p>
                                    )}

                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                                      <div className="flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-teal-600" />
                                        <span>
                                          {plan.cancellationPolicy === 'FREE_CANCELLATION'
                                            ? `Free Cancellation (${plan.cancellationDeadlineHours}h prior)`
                                            : plan.cancellationPolicy === 'NON_REFUNDABLE'
                                            ? 'Non-refundable'
                                            : plan.cancellationPolicy}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-stone-600">
                                          {plan.taxesIncluded ? '✓ Taxes included' : 'Taxes may apply'}
                                        </span>
                                      </div>
                                      {plan.validFrom && plan.validTo && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-stone-400" />
                                          <span>
                                            Valid {new Date(plan.validFrom).toLocaleDateString('en-IN')} →{' '}
                                            {new Date(plan.validTo).toLocaleDateString('en-IN')}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100">
                                    <div className="text-right">
                                      <div className="text-base font-extrabold text-stone-900 flex items-center justify-end">
                                        <IndianRupee className="w-3.5 h-3.5" />
                                        <span>{plan.basePrice?.toLocaleString('en-IN')}</span>
                                        <span className="text-[10px] text-stone-500 font-normal ml-1">/ {plan.priceUnit?.toLowerCase() || 'night'}</span>
                                      </div>
                                      <span className="text-[10px] text-emerald-800 font-medium">Standard Tariff ({plan.currency})</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl bg-stone-100/60 p-3 text-[11px] text-stone-500 italic">
                              Rate plan details not yet configured by property. Indicative property rates apply.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-xl bg-stone-100 p-3 text-[11px] text-stone-500 flex items-start gap-2">
                    <Info className="h-4 w-4 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Physical Capacity Transparency:</strong> Availability is computed strictly on physical room units. All rate plans for a room type draw from the same physical unit capacity. Phase 22.5 availability calculation; direct bookings and reservations are handled in Phase 22.6.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-center">
                  <BedDouble className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                  <p className="text-xs font-semibold text-stone-700">Room Configurations Unavailable</p>
                  <p className="mt-1 text-[11px] text-stone-500 max-w-sm mx-auto">
                    Live room availability is not currently provided for this dataset property. Contact the property directly for room enquiries.
                  </p>
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-indigo-900" />
                Property Amenities & Features
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

            {/* Provenance & Data Integrity Transparency */}
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-700" />
                Data Provenance & Live Inventory Status
              </h3>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                {isPartner
                  ? 'This property is managed by a verified YatraSetu partner. Room configurations and physical inventory are updated in real-time.'
                  : 'Live availability is not currently provided for this dataset property. Listed ratings, amenities, and pricing are baseline indicators from the curated catalog.'}
              </p>
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

          {/* Right Column: Property Information / Stay Calculation Card */}
          <div>
            <div className="sticky top-20 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-baseline justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs text-stone-400">
                    {isPartner ? 'Partner Base Tariff' : 'Indicative Dataset Rate'}
                  </span>
                  <div className="text-2xl font-black text-stone-900 flex items-center mt-0.5">
                    <IndianRupee className="h-5 w-5" />
                    {Number(hotel.pricePerNight).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-stone-500 ml-1">/night</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                  {isPartner ? 'Partner Property' : 'Dataset Record'}
                </span>
              </div>

              {inquirySubmitted ? (
                <div className="rounded-2xl bg-teal-50 border border-teal-200 p-5 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-teal-600 mb-2" />
                  <h4 className="text-sm font-bold text-teal-900">Stay Evaluated</h4>
                  <p className="mt-1 text-xs text-teal-700">
                    Stay window ({checkInDate} → {checkOutDate}, {guestCount} guest(s)) evaluated. Direct online booking and payment integration will launch in Phase 22.6.
                  </p>
                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="mt-4 text-xs font-semibold text-teal-900 underline"
                  >
                    Modify parameters
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Check-in / Check-out Display */}
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
                    <div className="flex justify-between items-center text-stone-700">
                      <span className="font-semibold">Check-in:</span>
                      <span className="font-bold text-stone-900">{checkInDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-700">
                      <span className="font-semibold">Check-out:</span>
                      <span className="font-bold text-stone-900">{checkOutDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-700 pt-1.5 border-t border-stone-200">
                      <span className="font-semibold">Nights:</span>
                      <span className="font-bold text-indigo-950">
                        {availabilityData?.nights || Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))} Night(s)
                      </span>
                    </div>
                  </div>

                  {/* Availability Summary */}
                  {availabilityData && (
                    <div className="rounded-xl p-3.5 border space-y-1.5 bg-stone-50 border-stone-200">
                      <div className="flex justify-between text-stone-600">
                        <span>Availability Status:</span>
                        <span className="font-bold">
                          {availabilityData.status === 'AVAILABLE' && <span className="text-emerald-700">AVAILABLE</span>}
                          {availabilityData.status === 'LIMITED' && <span className="text-amber-700">LIMITED</span>}
                          {availabilityData.status === 'SOLD_OUT' && <span className="text-rose-700">SOLD OUT</span>}
                          {availabilityData.status === 'UNAVAILABLE_DATA' && <span className="text-stone-600">UNAVAILABLE (DATASET)</span>}
                        </span>
                      </div>
                      {availabilityData.rooms && availabilityData.rooms.length > 0 && (
                        <div className="flex justify-between text-stone-600 pt-1 border-t border-stone-200">
                          <span>Total Available Units:</span>
                          <span className="font-bold text-stone-900">
                            {availabilityData.rooms.reduce((sum, r) => sum + r.availableUnits, 0)} Units across {availabilityData.rooms.length} configurations
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setInquirySubmitted(true)}
                    className="w-full rounded-xl bg-indigo-900 py-3 text-xs font-bold text-white transition-colors hover:bg-indigo-800 shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Evaluate Stay Parameters</span>
                  </button>

                  <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                    <p className="font-semibold">Phase 22.5 Architectural Boundary:</p>
                    <p className="mt-0.5 text-amber-800">
                      Physical capacity and blocked maintenance calculations are active. Booking, payment, and reservation locks will launch in Phase 22.6.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
