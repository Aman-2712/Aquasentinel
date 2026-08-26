'use client';

import { useState, useEffect } from 'react';
import IntroOverlay from './IntroOverlay';

interface IntroWrapperProps {
  children: React.ReactNode;
}

export default function IntroWrapper({ children }: IntroWrapperProps) {
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasPlayed = sessionStorage.getItem('aquasentinel_intro_played');
    if (!hasPlayed) {
      setShowIntro(true);
    } else {
      document.documentElement.classList.remove('intro-pending');
    }
  }, []);

  const handleComplete = () => {
    try {
      sessionStorage.setItem('aquasentinel_intro_played', 'true');
      document.documentElement.classList.remove('intro-pending');
    } catch (e) {
      console.warn('sessionStorage is not available:', e);
      document.documentElement.classList.remove('intro-pending');
    }
    setShowIntro(false);
  };

  // Prevent server-side hydration mismatch by rendering IntroOverlay only after mounting on client
  return (
    <>
      {mounted && showIntro && <IntroOverlay onComplete={handleComplete} />}
      {children}
    </>
  );
}
