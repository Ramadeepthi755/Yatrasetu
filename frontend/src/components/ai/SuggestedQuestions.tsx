'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  isLoading?: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelectQuestion,
  isLoading = false,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="py-2 px-1">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-primary" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectQuestion(q)}
            className="text-left text-xs bg-gray-50 hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 border border-gray-200 dark:border-gray-700 hover:border-primary text-gray-700 dark:text-gray-300 hover:text-primary py-1 px-2.5 rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
