'use client';

import React, { useState } from 'react';
import {
  Zap,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  CheckCircle,
  Flag,
  IndianRupee,
  Navigation,
  Sparkles,
  PhoneCall,
  AlertCircle,
  Info,
} from 'lucide-react';
import { ExperienceBooking } from '@/lib/api';

interface PartnerTripsTabProps {
  bookings: ExperienceBooking[];
  onStartTrip: (bookingId: string) => Promise<void>;
  onCompleteTrip: (bookingId: string) => Promise<void>;
  onCheckin: (bookingId: string, checkpointId: string, notes?: string) => Promise<void>;
  refreshBookings: () => void;
}

export default function PartnerTripsTab({
  bookings,
  onStartTrip,
  onCompleteTrip,
  onCheckin,
  refreshBookings,
}: PartnerTripsTabProps) {
  // Find Active Trips (IN_PROGRESS, CONFIRMED, or COMPLETION_PENDING)
  const activeOrUpcomingTrips = bookings.filter((b) =>
    ['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING'].includes(b.status)
  );

  const activeTrip = bookings.find((b) => b.status === 'IN_PROGRESS');

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('checkpoint_1');
  const [checkinNotes, setCheckinNotes] = useState<string>('');

  const handleStart = async (bookingId: string) => {
    setLoadingAction(bookingId);
    setActionMsg(null);
    try {
      await onStartTrip(bookingId);
      setActionMsg({ text: 'Trip started! Safety monitoring active.', type: 'success' });
      refreshBookings();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to start trip.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    setLoadingAction(bookingId);
    setActionMsg(null);
    try {
      await onCompleteTrip(bookingId);
      setActionMsg({
        text: 'Trip marked as completed by provider. Awaiting tourist confirmation.',
        type: 'success',
      });
      refreshBookings();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to complete trip.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePerformCheckin = async (bookingId: string) => {
    setLoadingAction(`checkin_${bookingId}`);
    setActionMsg(null);
    try {
      await onCheckin(bookingId, selectedCheckpoint, checkinNotes);
      setActionMsg({ text: `Safety checkpoint [${selectedCheckpoint}] verified and logged!`, type: 'success' });
      setCheckinNotes('');
      refreshBookings();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to log checkpoint.', type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#171717]">Trip Operations & Safety Console</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> {activeOrUpcomingTrips.length} Active / Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor departure times, log safety checkpoints, and manage the complete trip lifecycle.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          {actionMsg.text}
        </div>
      )}

      {/* Live Active Trip Hero Banner (if a trip is in progress) */}
      {activeTrip && (
        <div className="bg-gradient-to-br from-[#0F766E] to-[#115E59] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                Live Trip in Progress
              </span>
              <span className="text-xs text-teal-200 font-mono">#{activeTrip.bookingReference}</span>
            </div>

            {activeTrip.status === 'COMPLETION_PENDING' ? (
              <span className="px-4 py-2 bg-purple-900/80 border border-purple-400/40 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
                <Info className="w-4 h-4 text-purple-300" />
                Awaiting Tourist Final Confirmation
              </span>
            ) : (
              <button
                onClick={() => handleComplete(activeTrip.id)}
                disabled={loadingAction === activeTrip.id}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0B192C] text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <Flag className="w-4 h-4" />
                {loadingAction === activeTrip.id ? 'Submitting...' : 'Mark Trip as Completed'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-xs text-teal-200 font-semibold uppercase tracking-wider block">Tourist / Guest</span>
              <div className="text-sm font-bold text-white">{activeTrip.touristName || 'Registered Guest'}</div>
              <p className="text-xs text-teal-100">{activeTrip.guestCount} Guests · {activeTrip.touristEmail || 'Private Tour'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-xs text-teal-200 font-semibold uppercase tracking-wider block">Experience</span>
              <div className="text-sm font-bold text-white truncate">{activeTrip.experienceTitle || 'Custom Circuit'}</div>
              <p className="text-xs text-teal-100">{activeTrip.destinationName || 'Destination Hub'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-xs text-teal-200 font-semibold uppercase tracking-wider block">Safety Status</span>
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Transit Monitored
              </div>
              <p className="text-xs text-teal-100">0 Reported Incidents · Active Safety Feed</p>
            </div>
          </div>

          {/* Real-time Checkpoint Logger */}
          <div className="p-5 rounded-2xl bg-black/20 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-300" /> Log Transit Checkpoint
              </span>
              <span className="text-teal-200 text-[11px]">Updates tourist safety dashboard</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCheckpoint}
                onChange={(e) => setSelectedCheckpoint(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white outline-none focus:bg-teal-900"
              >
                <option value="checkpoint_1" className="text-slate-900">Checkpoint 1: Meeting & Orientation</option>
                <option value="checkpoint_2" className="text-slate-900">Checkpoint 2: Primary Heritage Site</option>
                <option value="checkpoint_3" className="text-slate-900">Checkpoint 3: Artisan Workshop Demonstration</option>
                <option value="checkpoint_4" className="text-slate-900">Checkpoint 4: Return & Safe Conclusion</option>
              </select>

              <input
                type="text"
                value={checkinNotes}
                onChange={(e) => setCheckinNotes(e.target.value)}
                placeholder="Optional notes (e.g., reached temple courtyard on schedule)"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/50 outline-none"
              />

              <button
                onClick={() => handlePerformCheckin(activeTrip.id)}
                disabled={loadingAction === `checkin_${activeTrip.id}`}
                className="px-4 py-2 bg-white text-[#0F766E] text-xs font-bold rounded-xl hover:bg-teal-50 transition-colors whitespace-nowrap"
              >
                Log Checkpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of All Scheduled / Active / Completion Pending Trips */}
      {activeOrUpcomingTrips.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171717]">No Upcoming Trips Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When tourists confirm bookings and secure payments, their trips will appear here for safety check-ins and
            live departure management.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeOrUpcomingTrips.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#171717]">{b.experienceTitle || 'Custom Itinerary Tour'}</h4>
                    <span className="text-xs font-mono text-slate-400">#{b.bookingReference}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tourist: <span className="font-semibold text-slate-700">{b.touristName}</span> ({b.guestCount} Guests)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'IN_PROGRESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'COMPLETION_PENDING'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Timing & Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium">Scheduled Date</span>
                  <span className="font-bold text-[#171717]">{b.bookingDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium">Departure Time</span>
                  <span className="font-bold text-[#171717]">{b.startTime || '09:00 AM'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium">Destination</span>
                  <span className="font-bold text-[#171717] truncate block">{b.destinationName || 'Local Circuit'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-0.5 font-medium">Initial Payment</span>
                  <span className="font-bold text-emerald-700">Secured (₹{b.totalAmount?.toLocaleString('en-IN')})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {b.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStart(b.id)}
                    disabled={loadingAction === b.id}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    {loadingAction === b.id ? 'Starting...' : 'Start Trip'}
                  </button>
                )}

                {b.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleComplete(b.id)}
                    disabled={loadingAction === b.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {loadingAction === b.id ? 'Completing...' : 'Mark Trip Complete'}
                  </button>
                )}

                {b.status === 'COMPLETION_PENDING' && (
                  <span className="text-xs text-purple-700 font-semibold flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                    <Info className="w-3.5 h-3.5" /> Awaiting Tourist Confirmation for Final Payment Release
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
