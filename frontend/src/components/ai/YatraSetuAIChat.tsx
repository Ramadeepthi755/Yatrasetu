'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  sendAiChat,
  getSuggestedQuestions,
  AiChatRequest,
  AiEntityReference,
} from '@/lib/api';
import { ChatMessage } from './ChatMessage';
import { SuggestedQuestions } from './SuggestedQuestions';
import {
  Sparkles,
  Send,
  Loader2,
  Calendar,
  X,
  ShieldCheck,
  Minimize2,
  Maximize2,
  Trash2,
} from 'lucide-react';

interface YatraSetuAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: {
    path?: string;
    destinationId?: string;
    cityId?: string;
    destinationName?: string;
  };
}

interface MessageState {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  role?: string;
  provider?: string;
  fallback?: boolean;
  disclaimer?: string;
  entities?: AiEntityReference[];
  timestamp: string;
}

export const YatraSetuAIChat: React.FC<YatraSetuAIChatProps> = ({
  isOpen,
  onClose,
  pageContext,
}) => {
  const router = useRouter();
  const { user, token, role, isAuthenticated, openAuthModal } = useAuth();

  const [messages, setMessages] = useState<MessageState[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isOpen]);

  // Load contextual suggested questions on mount or when destination changes
  useEffect(() => {
    let isMounted = true;
    const loadSuggestions = async () => {
      try {
        const res = await getSuggestedQuestions(
          pageContext?.destinationId,
          pageContext?.path,
          token || undefined
        );
        if (isMounted && res.success && res.data.questions) {
          setSuggestedQuestions(res.data.questions);
        }
      } catch (e) {
        // Fallback default suggestions
        if (isMounted) {
          setSuggestedQuestions([
            'What are top UNESCO heritage sites in India?',
            'How does YatraSetu calculate honest budgets?',
            'Recommend heritage trips for this weekend',
          ]);
        }
      }
    };

    if (isOpen) {
      loadSuggestions();
    }
    return () => {
      isMounted = false;
    };
  }, [pageContext?.destinationId, pageContext?.path, isOpen, token]);

  // Initial welcome message if thread is empty
  useEffect(() => {
    if (messages.length === 0) {
      const destName = pageContext?.destinationName;
      let greeting = 'Namaste! I am your **YatraSetu AI Assistant**. ';
      if (destName) {
        greeting += `I see you are viewing **${destName}**. I can answer questions about verified heritage monuments, authentic regional cuisine, local hosts, and weather conditions!`;
      } else {
        greeting += 'I can help you explore 90+ verified Indian destinations, find authentic regional cuisine, or design a custom day-by-day smart trip plan.';
      }

      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          content: greeting,
          role: role || 'GUEST',
          provider: 'YatraSetu Grounded Engine',
          fallback: true,
          disclaimer: 'Zero-hallucination verified dataset with live Open-Meteo weather integration.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [pageContext?.destinationName, role, messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    const userMsg: MessageState = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const payload: AiChatRequest = {
        message: messageText,
        conversationId: conversationId || undefined,
        pageContext: {
          path: pageContext?.path,
          destinationId: pageContext?.destinationId,
          cityId: pageContext?.cityId,
          destinationName: pageContext?.destinationName,
        },
      };

      const res = await sendAiChat(payload, token || undefined);

      if (res.success && res.data) {
        if (res.data.conversationId) {
          setConversationId(res.data.conversationId);
        }

        const assistantMsg: MessageState = {
          id: 'msg-' + Date.now() + '-reply',
          sender: 'assistant',
          content: res.data.message,
          role: res.data.role,
          provider: res.data.provider,
          fallback: res.data.fallback,
          disclaimer: res.data.disclaimer,
          entities: res.data.relevantEntities,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof TypeError && err.message.toLowerCase().includes('fetch')
        ? 'The backend is not reachable right now. You can still browse the app, or start the backend at http://localhost:8080.'
        : err instanceof Error ? err.message : 'Unable to connect to AI assistant.';
      const fallbackErrorMsg: MessageState = {
        id: 'msg-' + Date.now() + '-err',
        sender: 'assistant',
        content: `**Notice:** ${errorMsg}\n\nPlease check your network connection or verify your backend is running.`,
        role: role || 'GUEST',
        fallback: true,
        disclaimer: 'Connection issue encountered.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setConversationId('');
  };

  const handleOpenPlanner = () => {
    onClose();
    if (pageContext?.destinationId) {
      router.push(`/plan-trip?destinationId=${pageContext.destinationId}`);
    } else {
      router.push('/plan-trip');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl ${
        isExpanded
          ? 'inset-4 md:inset-10 rounded-2xl'
          : 'bottom-20 right-2 left-2 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[440px] h-[580px] max-h-[75vh] sm:max-h-[85vh] rounded-3xl'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-primary/5 via-orange-500/5 to-transparent rounded-t-3xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                YatraSetu AI
              </h3>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {role || 'GUEST'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {pageContext?.destinationName
                ? `Context: ${pageContext.destinationName}`
                : 'Zero-Hallucination Indian Travel AI'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <button
            onClick={handleOpenPlanner}
            title="Open Smart Trip Planner"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-xs mr-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plan Trip</span>
          </button>
          <button
            onClick={handleClearHistory}
            title="Clear Chat"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors hidden sm:block"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            role={msg.role}
            provider={msg.provider}
            fallback={msg.fallback}
            disclaimer={msg.disclaimer}
            entities={msg.entities}
            timestamp={msg.timestamp}
          />
        ))}

        {isLoading && (
          <div className="flex gap-2.5 my-3 items-center text-xs text-gray-500">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>Verifying YatraSetu facts & retrieving live weather...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="px-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelectQuestion={(q) => handleSendMessage(q)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Input Box & Actions */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-3xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              pageContext?.destinationName
                ? `Ask about ${pageContext.destinationName} (POIs, food, weather)...`
                : 'Ask anything about Indian heritage travel...'
            }
            disabled={isLoading}
            className="flex-1 text-xs py-2.5 px-3.5 bg-gray-100 dark:bg-gray-800 rounded-full border border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all text-gray-800 dark:text-gray-100 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-between mt-2 pt-1 px-1 text-[10px] text-gray-400">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero-Hallucination Policy</span>
          </div>
          <span>Powered by YatraSetu Grounded AI</span>
        </div>
      </div>
    </div>
  );
};
