'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  IndianRupee,
  Search,
  Filter,
  CheckCircle,
  Play,
  Flag,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Send,
  X,
  Bell,
  Check,
  Ban,
  Loader2,
} from 'lucide-react';
import {
  ExperienceBooking,
  getBookingMessages,
  sendBookingMessage,
  BookingMessage,
  acceptPartnerBooking,
  rejectPartnerBooking,
  recordCashMilestone,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PartnerBookingsTabProps {
  bookings: ExperienceBooking[];
  onStartTrip: (bookingId: string) => Promise<void>;
  onCompleteTrip: (bookingId: string) => Promise<void>;
  refreshBookings: () => void;
}

export default function PartnerBookingsTab({
  bookings,
  onStartTrip,
  onCompleteTrip,
  refreshBookings,
}: PartnerBookingsTabProps) {
  const { token, user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Messaging Modal State
  const [activeChatBooking, setActiveChatBooking] = useState<ExperienceBooking | null>(null);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleAccept = async (bookingId: string) => {
    if (!token) return;
    setActionLoadingId(`accept_${bookingId}`);
    try {
      await acceptPartnerBooking(bookingId, token);
      refreshBookings();
    } catch (e: any) {
      alert(e.message || 'Failed to accept booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!token) return;
    const reason = prompt('Please provide a reason for declining this request:');
    if (reason === null) return;
    setActionLoadingId(`reject_${bookingId}`);
    try {
      await rejectPartnerBooking(bookingId, reason, token);
      refreshBookings();
    } catch (e: any) {
      alert(e.message || 'Failed to reject booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRecordMilestone = async (bookingId: string, milestoneNum: number) => {
    if (!token) return;
    setActionLoadingId(`milestone_${bookingId}_${milestoneNum}`);
    try {
      await recordCashMilestone(bookingId, milestoneNum, token);
      refreshBookings();
    } catch (e: any) {
      alert(e.message || 'Failed to record cash milestone');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openChat = async (booking: ExperienceBooking) => {
    if (!token) return;
    setActiveChatBooking(booking);
    setLoadingMessages(true);
    try {
      const res = await getBookingMessages(booking.id, token);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeChatBooking || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await sendBookingMessage(activeChatBooking.id, newMessage.trim(), token);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        setNewMessage('');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      b.touristName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.experienceTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#171717]">Reservations &amp; Bookings</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
              {bookings.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all direct bookings, incoming guest requests, and milestone payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search tourist or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E] w-48 sm:w-56"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested (New)</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETION_PENDING">Completion Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171717]">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || filterStatus !== 'ALL'
              ? 'Try adjusting your search query or status filter.'
              : 'Confirmed guest bookings will appear here once reservations are created.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all space-y-3 ${
                b.status === 'REQUESTED' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              {/* Notification Banner for New Requests (Requirement 6, 8) */}
              {b.status === 'REQUESTED' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span>
                      🔔 New Trip Request: <strong className="text-amber-950">{b.touristName}</strong> has requested {b.experienceTitle} for {b.bookingDate} at {b.startTime || '09:00 AM'}.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(b.id)}
                      disabled={actionLoadingId === `accept_${b.id}`}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      {actionLoadingId === `accept_${b.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Accept Booking
                    </button>
                    <button
                      onClick={() => handleReject(b.id)}
                      disabled={actionLoadingId === `reject_${b.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" /> Reject
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#171717]">{b.experienceTitle || 'Custom Circuit Tour'}</h4>
                    <span className="text-xs font-mono text-slate-400">#{b.bookingReference}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>
                      Guest: <strong className="text-slate-700">{b.touristName || 'Traveler'}</strong>
                    </span>
                    <span>·</span>
                    <span>{b.guestCount} Guests</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-bold">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'IN_PROGRESS'
                        ? 'bg-sky-100 text-sky-800'
                        : b.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-800'
                        : b.status === 'REQUESTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      b.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.paymentStatus || 'PENDING'} {b.paymentMethod ? `(${b.paymentMethod})` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Tour Date</span>
                  <span className="font-bold text-[#171717]">{b.bookingDate}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Time</span>
                  <span className="font-bold text-[#171717]">{b.startTime || '09:00 AM'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Meeting Point</span>
                  <span className="font-bold text-[#171717] truncate block">{b.meetingPointName || b.destinationName || 'Landmark'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px]">Booking Type</span>
                  <span className="font-bold text-indigo-700">{b.bookingType}</span>
                </div>
              </div>

              {/* Cash Milestone Tracking Actions (Requirement 17, 18) */}
              {b.paymentMethod === 'CASH' && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-amber-950">Cash Milestone Status:</span>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Milestone 1: {b.cashMilestone1Paid ? '✓ ₹' + (b.cashMilestone1Amount || b.totalAmount / 2) + ' Paid' : '⏳ ₹' + (b.cashMilestone1Amount || b.totalAmount / 2) + ' Due at Start'} · 
                      Milestone 2: {b.cashMilestone2Paid ? '✓ ₹' + (b.cashMilestone2Amount || b.totalAmount / 2) + ' Paid' : '⏳ ₹' + (b.cashMilestone2Amount || b.totalAmount / 2) + ' Due on End'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!b.cashMilestone1Paid && (
                      <button
                        onClick={() => handleRecordMilestone(b.id, 1)}
                        disabled={actionLoadingId === `milestone_${b.id}_1`}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition shadow-2xs"
                      >
                        {actionLoadingId === `milestone_${b.id}_1` ? 'Recording...' : `Record Milestone 1 (₹${b.cashMilestone1Amount || b.totalAmount / 2})`}
                      </button>
                    )}
                    {b.cashMilestone1Paid && !b.cashMilestone2Paid && ['COMPLETION_PENDING', 'COMPLETED'].includes(b.status) && (
                      <button
                        onClick={() => handleRecordMilestone(b.id, 2)}
                        disabled={actionLoadingId === `milestone_${b.id}_2`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-2xs"
                      >
                        {actionLoadingId === `milestone_${b.id}_2` ? 'Recording...' : `Record Milestone 2 (₹${b.cashMilestone2Amount || b.totalAmount / 2})`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {['CONFIRMED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED'].includes(b.status) && (
                  <button
                    onClick={() => openChat(b)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0F766E]" /> Message Guest
                  </button>
                )}

                {b.status === 'CONFIRMED' && (
                  <button
                    onClick={async () => {
                      await onStartTrip(b.id);
                      refreshBookings();
                    }}
                    className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#0D9488] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Start Trip Now
                  </button>
                )}

                {['IN_PROGRESS', 'COMPLETION_PENDING'].includes(b.status) && (
                  <button
                    onClick={async () => {
                      await onCompleteTrip(b.id);
                      refreshBookings();
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-white" /> Complete Trip
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaging Modal */}
      {activeChatBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-800 border border-teal-600 flex items-center justify-center font-bold text-sm">
                  {activeChatBooking.touristName ? activeChatBooking.touristName[0] : 'G'}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{activeChatBooking.touristName || 'Traveler'}</h3>
                  <p className="text-[11px] text-teal-200">
                    Booking #{activeChatBooking.bookingReference} · {activeChatBooking.destinationName || 'Destination'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveChatBooking(null)}
                className="w-8 h-8 rounded-full bg-teal-800/80 hover:bg-teal-700 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50 min-h-[250px] max-h-[400px]">
              {loadingMessages ? (
                <div className="text-center py-10 text-xs text-slate-400">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 space-y-1">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">No messages yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Send a message regarding meeting points, schedule, or coordination!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isProviderMsg = m.senderRole === 'PROVIDER' || m.senderRole === 'HOST';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isProviderMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                        {m.senderName} ({m.senderRole})
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isProviderMsg
                            ? 'bg-[#0F766E] text-white rounded-br-none shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message to the guest..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0F766E]"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D9488] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
