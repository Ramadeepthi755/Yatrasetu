'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { YatraSetuAIButton } from './YatraSetuAIButton';

// Lazy-load the chat drawer dynamically to guarantee 0 impact on initial page performance
const YatraSetuAIChat = dynamic(
  () => import('./YatraSetuAIChat').then((mod) => mod.YatraSetuAIChat),
  { ssr: false }
);

export const YatraSetuAIAssistant: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Derive safe page context purely for informational context
  const pageContext = useMemo(() => {
    let destinationId: string | undefined;
    let destinationName: string | undefined;

    if (pathname?.startsWith('/destinations/')) {
      const parts = pathname.split('/');
      if (parts.length >= 3 && parts[2]) {
        destinationId = parts[2];
        // Format friendly fallback name from slug or ID if not yet resolved
        const raw = parts[2].replace('dest-', '').replace(/-/g, ' ');
        destinationName = raw.charAt(0).toUpperCase() + raw.slice(1);
      }
    }

    return {
      path: pathname,
      destinationId,
      destinationName,
    };
  }, [pathname]);

  return (
    <>
      <YatraSetuAIButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        destinationName={pageContext.destinationName}
        role={role || 'GUEST'}
      />

      {isOpen && (
        <YatraSetuAIChat
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          pageContext={pageContext}
        />
      )}
    </>
  );
};
