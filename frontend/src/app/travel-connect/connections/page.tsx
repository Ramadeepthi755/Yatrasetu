'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  getConnections,
  getConnectionMessages,
  sendConnectionMessage,
  ConnectionItem,
  ChatMessageItem,
} from '@/lib/api';
import TravelConnectNav from '@/components/travel-connect/TravelConnectNav';
import {
  MessageSquare,
  Users,
  Send,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  Shield,
  ArrowLeft,
} from 'lucide-react';

export default function ConnectionsPage() {
  const { user, token, isAuthenticated, openAuthModal } = useAuth();

  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadConnections = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getConnections(token || undefined);
        if (res.success && res.data) {
          setConnections(res.data);
          if (res.data.length > 0) {
            setSelectedConnection(res.data[0]);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load connections.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadConnections();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!selectedConnection) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await getConnectionMessages(
          selectedConnection.requestId,
          token || undefined
        );
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConnection, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection || !newMessage.trim()) return;

    setSending(true);
    try {
      const res = await sendConnectionMessage(
        selectedConnection.requestId,
        newMessage.trim(),
        token || undefined
      );

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage('');
      }
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <TravelConnectNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-600" />
            Connected Travelers & In-App Chat
          </h1>
          <p className="text-xs text-gray-500">
            Coordinate travel details, safe meetups, and itineraries with your accepted travel buddies.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-gray-900">Sign in to view messages</h3>
              <p className="text-xs text-gray-500">
                You must be logged in to access connected travel buddies and in-app communications.
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
        ) : loading ? (
          <div className="h-96 bg-white rounded-3xl border border-gray-200 p-8 flex items-center justify-center text-xs text-gray-400">
            Loading connections...
          </div>
        ) : connections.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-gray-900">No connected travel buddies yet</h3>
              <p className="text-xs text-gray-500">
                Once a traveler accepts your connection request (or you accept theirs), you can chat and plan together right here.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/travel-connect"
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow transition inline-flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                Discover Travelers
              </Link>
              <Link
                href="/travel-connect/requests"
                className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Check Pending Requests
              </Link>
            </div>
          </div>
        ) : (
          /* Main Two-Column Layout */
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            {/* Left Column: Connections Directory */}
            <div className="md:col-span-4 border-r border-gray-200 flex flex-col bg-gray-50/50">
              <div className="p-4 border-b border-gray-200 bg-white">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Connections ({connections.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {connections.map((conn) => {
                  const isSelected = selectedConnection?.requestId === conn.requestId;
                  return (
                    <button
                      key={conn.requestId}
                      onClick={() => setSelectedConnection(conn)}
                      className={`w-full text-left p-4 flex items-start gap-3 transition ${
                        isSelected
                          ? 'bg-amber-50/80 border-l-4 border-amber-600'
                          : 'hover:bg-gray-100/80'
                      }`}
                    >
                      {conn.connectedUserImageUrl ? (
                        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-amber-200">
                          <Image
                            src={conn.connectedUserImageUrl}
                            alt={conn.connectedUserName}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 border border-amber-300">
                          {conn.connectedUserName ? conn.connectedUserName.charAt(0).toUpperCase() : 'T'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {conn.connectedUserName}
                          </span>
                        </div>
                        {conn.destinationName && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            {conn.destinationName}
                          </span>
                        )}
                        {conn.connectedUserBio && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5 italic">
                            {conn.connectedUserBio}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className="md:col-span-8 flex flex-col bg-white">
              {selectedConnection ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      {selectedConnection.connectedUserImageUrl ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200">
                          <Image
                            src={selectedConnection.connectedUserImageUrl}
                            alt={selectedConnection.connectedUserName}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0">
                          {selectedConnection.connectedUserName
                            ? selectedConnection.connectedUserName.charAt(0).toUpperCase()
                            : 'T'}
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold text-sm text-gray-900">
                          {selectedConnection.connectedUserName}
                        </h3>
                        {selectedConnection.destinationName && (
                          <p className="text-[11px] text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            Traveling to {selectedConnection.destinationName}
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/travel-connect/${selectedConnection.connectedUserId}`}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition"
                    >
                      View Profile
                    </Link>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[440px] bg-stone-50/40">
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/50 text-[11px] text-amber-900 text-center flex items-center justify-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        You are connected on YatraSetu! For your safety, meet in public spots and avoid sending payments.
                      </span>
                    </div>

                    {loadingMessages ? (
                      <div className="text-center py-8 text-xs text-gray-400 animate-pulse">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 space-y-2">
                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                        <p className="text-xs text-gray-500">
                          No messages yet. Say hello and coordinate your travel itinerary!
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = user?.id === msg.senderId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                isMe
                                  ? 'bg-amber-600 text-white rounded-br-xs'
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                              }`}
                            >
                              {msg.messageText}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Footer */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-gray-200 bg-white flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message to your travel buddy..."
                      className="flex-1 text-xs sm:text-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow transition flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                    >
                      {sending ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-xs text-gray-400">
                  Select a connected traveler from the list to view your chat.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
