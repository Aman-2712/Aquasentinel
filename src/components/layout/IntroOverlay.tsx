'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './IntroOverlay.module.css';

interface IntroOverlayProps {
  onComplete: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleClose = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);

    // Wait for the opacity fade-out transition to complete (800ms)
    transitionTimeout.current = setTimeout(() => {
      onComplete();
    }, 800);
  };

  useEffect(() => {
    // Autoplay safety: attempt to play the video explicitly when mounted
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented or video failed to play:', err);
      });
    }

    return () => {
      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.overlay} ${isFadingOut ? styles.fadeOut : ''}`}>
      <video
        ref={videoRef}
        className={styles.video}
        src="/media/aquasentinel.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleClose}
      />
      <button className={styles.skipButton} onClick={handleClose}>
        <span>Skip Intro</span>
        <ChevronRight size={16} className={styles.skipIcon} />
      </button>
    </div>
  );
}
