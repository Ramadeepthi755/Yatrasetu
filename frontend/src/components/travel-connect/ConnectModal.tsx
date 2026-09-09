'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendConnectionRequest, TravelerDiscovery } from '@/lib/api';
import { X, Send, UserCheck, AlertCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface ConnectModalProps {
  traveler: TravelerDiscovery;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}

export default function ConnectModal({ traveler, onClose, onSuccess }: ConnectModalProps) {
  const { user, token, isAuthenticated, openAuthModal } = useAuth();
  const [message, setMessage] = useState(
    `Hi ${traveler.displayName}! I noticed you are traveling to ${traveler.destinationCity} around ${traveler.travelDate}. Would love to connect and share tips or explore together!`
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in to connect with travelers.');
      return;
    }

    if (user?.id === traveler.userId) {
      setError('You cannot send a connection request to yourself.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await sendConnectionRequest(
        {
          receiverId: traveler.userId,
          destinationId: traveler.destinationId,
          message: message.trim(),
        },
        token || undefined
      );

      if (res.success && res.data) {
        onSuccess(res.data.id);
      } else {
        setError(res.message || 'Failed to send connection request.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while sending your request.';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-200">Travel Connect</span>
            <h3 className="text-lg font-bold">Connect with {traveler.displayName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Traveler summary pill */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60 mb-5">
            <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0">
              {traveler.displayName ? traveler.displayName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 truncate">{traveler.displayName}</span>
                {traveler.isDemoData && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    Sample Traveler
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Visiting <span className="font-medium text-amber-800">{traveler.destinationCity}</span> &bull; {traveler.travelDate}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                {traveler.matchScore}%
              </span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="text-sm font-medium text-gray-800">
                You need to be signed in to send travel buddy connection requests.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('TRAVELER');
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow transition"
                >
                  Sign In as Traveler
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="intro-msg" className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Personal Intro Message
                </label>
                <textarea
                  id="intro-msg"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  className="w-full text-sm text-gray-900 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="Share what you are excited to see or suggest meeting up..."
                  required
                />
                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
                  <span>Introduce yourself and mention common travel interests.</span>
                  <span>{message.length}/500</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Connection Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
