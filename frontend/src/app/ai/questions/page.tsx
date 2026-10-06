'use client';

import Link from 'next/link';
import { ArrowLeft, BrainCircuit, Building2, Compass, Map, ShieldCheck, Users } from 'lucide-react';

const questionGroups = [
  {
    title: 'Plan a trip',
    icon: Map,
    questions: [
      'Plan a 3-day heritage trip with a realistic mid-range budget.',
      'Which destinations are good for a first cultural trip to India?',
      'Build a slow itinerary with local food, heritage, and rest time.',
    ],
  },
  {
    title: 'Find a stay',
    icon: Building2,
    questions: [
      'Show verified hotels, resorts, and homestays near this destination.',
      'What should I check before booking a homestay?',
      'Compare budget, mid-range, and heritage stay options.',
    ],
  },
  {
    title: 'Meet local people',
    icon: Users,
    questions: [
      'Find a local guide for a heritage walk.',
      'What local experiences support the community here?',
      'Help me choose a safe and authentic local host.',
    ],
  },
  {
    title: 'Travel responsibly',
    icon: ShieldCheck,
    questions: [
      'What should I know about local customs before visiting?',
      'How can I avoid overcrowded places and support local businesses?',
      'What safety details should I verify before this trip?',
    ],
  },
];

export default function AIQuestionsPage() {
  return (
    <main className="min-h-screen bg-[#FFFBF5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:text-[#115E59]">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        <header className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0F766E]">
            <BrainCircuit className="h-4 w-4" /> YatraSetu AI question library
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#171717] sm:text-4xl">Start with a useful question.</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            These are optional starting points. Choose one, edit it, or ask your own question in the AI assistant.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {questionGroups.map(({ title, icon: Icon, questions }) => (
            <section key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-[#0F766E]">
                <Icon className="h-5 w-5" />
                <h2 className="text-base font-bold text-[#171717]">{title}</h2>
              </div>
              <ul className="space-y-2">
                {questions.map((question) => (
                  <li key={question} className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-700">
                    {question}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <Compass className="h-4 w-4 shrink-0" /> Questions are optional and do not affect registration or onboarding.
        </div>
      </div>
    </main>
  );
}
