'use client';

import React from 'react';
import Link from 'next/link';
import { AiEntityReference } from '@/lib/api';
import { Sparkles, Bot, User, MapPin, Landmark, UtensilsCrossed, Hotel, ExternalLink, ShieldCheck } from 'lucide-react';

export interface ChatMessageProps {
  sender: 'user' | 'assistant';
  content: string;
  role?: string;
  provider?: string;
  fallback?: boolean;
  disclaimer?: string;
  entities?: AiEntityReference[];
  timestamp?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  content,
  role,
  provider,
  fallback,
  disclaimer,
  entities = [],
  timestamp,
}) => {
  const isUser = sender === 'user';

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'DESTINATION':
        return <MapPin className="w-3.5 h-3.5 text-amber-500" />;
      case 'POI':
        return <Landmark className="w-3.5 h-3.5 text-indigo-500" />;
      case 'FOOD':
        return <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />;
      case 'HOTEL':
        return <Hotel className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-primary" />;
    }
  };

  // Simple clean markdown-to-styled-elements renderer
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-gray-900 dark:text-white mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} className="text-sm font-semibold text-primary mt-2 mb-1">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="my-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border-l-2 border-amber-500 text-xs text-amber-900 dark:text-amber-200 rounded-r">
            {line.replace('> ', '')}
          </div>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 ml-4 list-disc">
            {renderBold(line.substring(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 ml-4 list-decimal">
            {renderBold(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          {renderBold(line)}
        </p>
      );
    });
  };

  const renderBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-gray-600 dark:text-gray-400">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-primary text-[11px] font-mono rounded">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-2.5 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-tr from-primary to-amber-500 text-white'
            : 'bg-gradient-to-tr from-indigo-600 to-primary text-white ring-1 ring-primary/30'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role / Provider Badge (for assistant) */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="w-2.5 h-2.5" />
              YatraSetu AI
            </span>
            <span>•</span>
            <span className="capitalize">{role?.toLowerCase() || 'traveler'} mode</span>
            {provider && (
              <>
                <span>•</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                  {fallback ? 'Grounded Engine' : provider}
                </span>
              </>
            )}
          </div>
        )}

        {/* Message Content Bubble */}
        <div
          className={`p-3.5 rounded-2xl text-xs ${
            isUser
              ? 'bg-gradient-to-r from-primary to-orange-600 text-white rounded-tr-none shadow-md'
              : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="space-y-1">{renderFormattedContent(content)}</div>
          )}

          {/* Linked verified entities */}
          {!isUser && entities && entities.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Verified YatraSetu Links:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entities.map((ent, i) => (
                  <Link
                    key={i}
                    href={ent.url || '#'}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800/80 hover:bg-primary/10 border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary rounded-lg text-[11px] font-medium transition-all group"
                  >
                    {getEntityIcon(ent.type)}
                    <span className="truncate max-w-[140px]">{ent.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Factual Disclaimer */}
          {!isUser && disclaimer && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{disclaimer}</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};
