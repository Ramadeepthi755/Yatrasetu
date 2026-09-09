'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from '@/components/SplashScreen';

export default function SplashWrapper() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Show splash only once per browser session
    const hasSeenSplash = sessionStorage.getItem('yatrasetu_splash_seen');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  const handleFinished = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('yatrasetu_splash_seen', 'true');
  }, []);

  if (!showSplash) return null;

  return <SplashScreen onFinished={handleFinished} />;
}
