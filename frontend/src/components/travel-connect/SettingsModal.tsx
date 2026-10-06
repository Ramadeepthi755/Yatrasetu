'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTravelConnectSettings, updateTravelConnectSettings } from '@/lib/api';
import { X, Shield, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { token, isAuthenticated } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const loadSettings = async () => {
      try {
        const res = await getTravelConnectSettings(token || undefined);
        if (res.success && res.data) {
          setEnabled(res.data.travelConnectEnabled);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [isAuthenticated, token]);

  const handleToggle = async () => {
    if (!isAuthenticated) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const nextState = !enabled;
      const res = await updateTravelConnectSettings(nextState, token || undefined);
      if (res.success && res.data) {
        setEnabled(res.data.travelConnectEnabled);
        setMessage(
          res.data.travelConnectEnabled
            ? 'Travel Connect enabled. Your trips are visible to other travelers.'
            : 'Travel Connect disabled. You are now hidden from search.'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update visibility settings.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">Travel Connect Visibility & Privacy</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isAuthenticated ? (
            <div className="text-center py-4 text-xs text-gray-500">
              Please sign in to manage your privacy and discovery settings.
            </div>
          ) : loading ? (
            <div className="text-center py-6 text-xs text-gray-400">Loading settings...</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {enabled ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs font-bold text-gray-900">
                      Show me in Travel Connect
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    When enabled, travelers heading to your destinations can find you and send
                    requests. When disabled, your trips and profile are completely hidden.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enabled ? 'bg-amber-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
