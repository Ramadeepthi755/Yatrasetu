'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  getReceivedRequests,
  getSentRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  blockUser,
  ConnectionRequestItem,
} from '@/lib/api';
import TravelConnectNav from '@/components/travel-connect/TravelConnectNav';
import {
  Users,
  Inbox,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  MapPin,
  AlertCircle,
  Ban,
  Compass,
} from 'lucide-react';

export default function RequestsPage() {
  const { token, isAuthenticated, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequestItem[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [recRes, sentRes] = await Promise.all([
        getReceivedRequests(token || undefined),
        getSentRequests(token || undefined),
      ]);

      if (recRes.success && recRes.data) {
        setReceivedRequests(recRes.data);
      }
      if (sentRes.success && sentRes.data) {
        setSentRequests(sentRes.data);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch travel requests.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [isAuthenticated, token]);

  const handleAccept = async (reqId: string) => {
    setActionLoadingId(reqId);
    try {
      const res = await acceptConnectionRequest(reqId, token || undefined);
      if (res.success && res.data) {
        setReceivedRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'ACCEPTED' } : r))
        );
      }
    } catch (err) {
      alert('Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (reqId: string) => {
    setActionLoadingId(reqId);
    try {
      const res = await rejectConnectionRequest(reqId, token || undefined);
      if (res.success && res.data) {
        setReceivedRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'REJECTED' } : r))
        );
      }
    } catch (err) {
      alert('Failed to decline request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (reqId: string) => {
    setActionLoadingId(reqId);
    try {
      const res = await cancelConnectionRequest(reqId, token || undefined);
      if (res.success && res.data) {
        setSentRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'CANCELLED' } : r))
        );
      }
    } catch (err) {
      alert('Failed to cancel request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    try {
      await blockUser(userId, token || undefined);
      setReceivedRequests((prev) => prev.filter((r) => r.senderId !== userId));
      alert('User blocked.');
    } catch {
      alert('Failed to block user.');
    }
  };

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <TravelConnectNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" />
            Travel Connection Requests
          </h1>
          <p className="text-xs text-gray-500">
            Manage received invitations from travelers who want to explore together, or track requests you sent.
          </p>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-gray-900">Sign in to manage requests</h3>
              <p className="text-xs text-gray-500">
                You need to be signed in to see pending buddy requests, accept invitations, and chat with fellow travelers.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal('TRAVELER')}
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow transition"
              >
                Sign In as Traveler
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 gap-6">
              <button
                onClick={() => setActiveTab('received')}
                className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
                  activeTab === 'received'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Received Requests</span>
                {pendingReceivedCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">
                    {pendingReceivedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('sent')}
                className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 -mb-px ${
                  activeTab === 'sent'
                    ? 'border-amber-600 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Sent Requests</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full">
                  {sentRequests.length}
                </span>
              </button>
            </div>

            {/* Content Body */}
            {loading ? (
              <div className="space-y-4 py-8 text-center text-xs text-gray-400 animate-pulse">
                Loading requests...
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
                <p className="text-xs font-semibold text-red-700">{error}</p>
                <button
                  onClick={fetchRequests}
                  className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : activeTab === 'received' ? (
              /* Received Requests List */
              receivedRequests.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">No received connection requests</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    When other travelers discover your travel plans and request to connect, their invitations will appear here.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/travel-connect"
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Browse Travelers
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {req.senderImageUrl ? (
                            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={req.senderImageUrl}
                                alt={req.senderName}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 border border-amber-300">
                              {req.senderName ? req.senderName.charAt(0).toUpperCase() : 'T'}
                            </div>
                          )}

                          <div>
                            <Link
                              href={`/travel-connect/${req.senderId}`}
                              className="font-bold text-sm text-gray-900 hover:text-amber-700 transition"
                            >
                              {req.senderName}
                            </Link>
                            {req.destinationName && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-amber-600" />
                                For journey to <span className="font-semibold text-gray-800">{req.destinationName}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {req.status === 'ACCEPTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Accepted
                            </span>
                          ) : req.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                              <XCircle className="w-3.5 h-3.5" />
                              Declined
                            </span>
                          ) : req.status === 'CANCELLED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-full">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Note */}
                      {req.message && (
                        <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 border border-gray-100 italic leading-relaxed">
                          &ldquo;{req.message}&rdquo;
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs border-t border-gray-100">
                        <span className="text-[11px] text-gray-400">
                          Received {new Date(req.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoadingId === req.id}
                                className="px-3 py-1.5 font-semibold text-gray-600 hover:text-red-700 bg-gray-100 hover:bg-red-50 rounded-xl transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAccept(req.id)}
                                disabled={actionLoadingId === req.id}
                                className="px-4 py-1.5 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
                              >
                                {actionLoadingId === req.id ? 'Accepting...' : 'Accept Connection'}
                              </button>
                              <button
                                onClick={() => handleBlock(req.senderId)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition"
                                title="Block this user"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          ) : req.status === 'ACCEPTED' ? (
                            <Link
                              href="/travel-connect/connections"
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chat Now
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Sent Requests List */
              sentRequests.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">No sent requests</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    You haven&apos;t sent any connection requests yet. Find fellow travelers going to your destination and reach out!
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/travel-connect"
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Find Travelers
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {req.receiverImageUrl ? (
                            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={req.receiverImageUrl}
                                alt={req.receiverName}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 border border-amber-300">
                              {req.receiverName ? req.receiverName.charAt(0).toUpperCase() : 'T'}
                            </div>
                          )}

                          <div>
                            <Link
                              href={`/travel-connect/${req.receiverId}`}
                              className="font-bold text-sm text-gray-900 hover:text-amber-700 transition"
                            >
                              {req.receiverName}
                            </Link>
                            {req.destinationName && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-amber-600" />
                                For journey to <span className="font-semibold text-gray-800">{req.destinationName}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {req.status === 'ACCEPTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Accepted
                            </span>
                          ) : req.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                              <XCircle className="w-3.5 h-3.5" />
                              Declined
                            </span>
                          ) : req.status === 'CANCELLED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-full">
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                              <Clock className="w-3.5 h-3.5" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {req.message && (
                        <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100 italic leading-relaxed">
                          &ldquo;{req.message}&rdquo;
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-xs border-t border-gray-100">
                        <span className="text-[11px] text-gray-400">
                          Sent on {new Date(req.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancel(req.id)}
                              disabled={actionLoadingId === req.id}
                              className="px-3 py-1 font-semibold text-gray-600 hover:text-red-700 bg-gray-100 hover:bg-red-50 rounded-xl transition text-xs"
                            >
                              {actionLoadingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                            </button>
                          )}
                          {req.status === 'ACCEPTED' && (
                            <Link
                              href="/travel-connect/connections"
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Chat Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
