'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Settings, Shield, Bell, Key, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, role, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#171717]">Account Settings</h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Manage your account credentials, notifications, and security preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#312E81]" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-1">Registered Email:</span>
              <span className="font-semibold text-[#171717]">{user?.email || 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block mb-1">Stakeholder Role:</span>
              <span className="font-semibold text-[#312E81]">{role || 'GUEST'}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-4">
          <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F59E0B]" />
            Notifications
          </h2>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-[#312E81]" />
              <div>
                <span className="font-semibold text-[#171717] block">In-app Booking & Buddy Alerts</span>
                <span className="text-slate-500">Receive notifications for connection requests and itinerary updates.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-xs text-[#312E81] hover:underline font-semibold flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" /> Change Password
          </Link>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
