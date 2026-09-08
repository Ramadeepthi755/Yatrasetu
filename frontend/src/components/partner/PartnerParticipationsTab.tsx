'use client';

import React, { useState } from 'react';
import {
  Palette,
  Building2,
  Utensils,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { ExperienceSupportingProvider } from '@/lib/api';

interface PartnerParticipationsTabProps {
  participations: ExperienceSupportingProvider[];
  onRespond: (id: string, action: 'ACCEPT' | 'DECLINE', notes?: string) => Promise<void>;
  refreshParticipations: () => void;
}

export default function PartnerParticipationsTab({
  participations,
  onRespond,
  refreshParticipations,
}: PartnerParticipationsTabProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAction = async (id: string, action: 'ACCEPT' | 'DECLINE') => {
    setLoadingId(id);
    setActionMsg(null);
    try {
      await onRespond(id, action, action === 'ACCEPT' ? 'Accepted collaboration' : 'Declined at this time');
      setActionMsg({
        text: `Invitation ${action === 'ACCEPT' ? 'accepted! You are now part of this experience' : 'declined'}.`,
        type: 'success',
      });
      refreshParticipations();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to update invitation response.', type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const pending = participations.filter((p) => p.status === 'INVITED');
  const accepted = participations.filter((p) => p.status === 'ACCEPTED');
  const declined = participations.filter((p) => p.status === 'DECLINED');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#171717]">Supporting Cultural Collaborations</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {participations.length} Total
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Local guides and tour creators invite you as a featured artisan, cultural workshop host, homestay, or local
          culinary stop.
        </p>
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

      {/* Pending Invites */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting Your Response ({pending.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {pending.map((p) => (
              <div
                key={p.id}
                className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 text-[10px] font-bold uppercase">
                      {p.providerType}
                    </span>
                    <h4 className="text-sm font-bold text-[#171717]">{p.roleDescription || 'Supporting Partner'}</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Invited as partner for experience ID: <span className="font-mono text-slate-500">{p.experienceId || 'Regional Tour'}</span>
                  </p>
                  {p.notes && <p className="text-xs text-amber-800 italic">“{p.notes}”</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(p.id, 'DECLINE')}
                    disabled={loadingId === p.id}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAction(p.id, 'ACCEPT')}
                    disabled={loadingId === p.id}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Collaboration
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Participations */}
      {participations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#171717]">No Collaboration Invites Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When guides and tour organizers in your region add your workshop or accommodation as a supporting stop,
            their invitations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active & Historical Collaborations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {participations.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                    {p.providerType}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'DECLINED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#171717]">{p.roleDescription || 'Cultural Partner'}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Invited ID: {p.providerName || p.providerId}</p>
                </div>

                {p.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {p.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
