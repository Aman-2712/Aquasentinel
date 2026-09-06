'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, SkipForward, Droplets } from 'lucide-react';
import styles from './IntroLoader.module.css';

interface IntroLoaderProps {
  onComplete: () => void;
}

interface RainParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  opacity: number;
}

interface LogEntry {
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

const LOG_MESSAGES: { text: string; delay: number; type: 'info' | 'success' | 'warning' | 'danger' }[] = [
  { text: 'SYS BOOT: INITIALIZING FLOOD PROTOCOLS...', delay: 100, type: 'info' },
  { text: 'SATELLITE DOWNLINK: ATTEMPTING INSAT-3D SYNC...', delay: 600, type: 'info' },
  { text: 'DOWNLINK SECURED: TELEMETRY ALIGNED (OK)', delay: 1100, type: 'success' },
  { text: 'RETRIEVING VISAKHAPATNAM GIS SURFACE DATA...', delay: 1600, type: 'info' },
  { text: 'OVERLAYING HYDROMETEOROLOGICAL TOPOGRAPHY...', delay: 2100, type: 'info' },
  { text: 'IoT SENSOR NETWORKS: CONNECTING TO 47 SENSORS...', delay: 2600, type: 'info' },
  { text: 'IoT LINK ACTIVE: FETCHING RAIN DATA FIELDS...', delay: 3100, type: 'success' },
  { text: 'RUNNING AI XGBOOST PREDICTIVE INFERENCE...', delay: 3600, type: 'info' },
  { text: '⚠️ STORM CELL WARNING: RUNOFF DETECTED', delay: 4100, type: 'warning' },
  { text: 'CRITICAL HIGH-RISK ZONES LOCATED:', delay: 4600, type: 'danger' },
  { text: '  * POORNA MARKET: WATER LEVEL 142CM', delay: 4900, type: 'danger' },
  { text: '  * GAJUWAKA SECTOR: WATER LEVEL 118CM', delay: 5200, type: 'danger' },
  { text: 'GENERATE EVACUATION GUIDANCE MATRIX... DONE', delay: 5600, type: 'success' },
  { text: 'AquaSentinel SYSTEM INITIALIZED. WELCOME.', delay: 6100, type: 'success' },
];

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showHUD, setShowHUD] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  // Rain Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: RainParticle[] = [];
    const maxParticles = 120;

    // Create particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vx: Math.random() * 2 - 1 - 2, // Slanted wind factor
        vy: Math.random() * 10 + 12,   // Speed of rain
        len: Math.random() * 25 + 15,
        opacity: Math.random() * 0.4 + 0.15,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      ctx.fillStyle = 'rgba(4, 13, 31, 0.25)'; // Alpha trail logic for motion blur
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1.5;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Draw raindrop drop
        ctx.strokeStyle = `rgba(0, 212, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx, p.y + p.len);
        ctx.stroke();

        // Update positions
        p.y += p.vy;
        p.x += p.vx;

        // Reset off-screen particles
        if (p.y > height) {
          p.y = -p.len;
          p.x = Math.random() * width;
          p.vx = Math.random() * 2 - 1 - 2.5; // Wind blow towards left
          p.vy = Math.random() * 10 + 12;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sequenced Diagnostic Logs & Alerts
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Diagnostic typing logs
    LOG_MESSAGES.forEach((msg) => {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, { text: msg.text, type: msg.type }]);
      }, msg.delay);
      timeouts.push(t);
    });

    // Alert reveal at 3.8s
    const alertTimeout = setTimeout(() => {
      setShowAlert(true);
    }, 3800);
    timeouts.push(alertTimeout);

    // Logo reveal phase transition at 6.3s
    const transitionTimeout = setTimeout(() => {
      setShowHUD(false);
      setShowLogo(true);
    }, 6300);
    timeouts.push(transitionTimeout);

    // Complete loader at 9.0s
    const doneTimeout = setTimeout(() => {
      onComplete();
    }, 9000);
    timeouts.push(doneTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  return (
    <div className={styles.introContainer}>
      <div className={styles.gridBg} />
      <div className={styles.scanlines} />

      {/* Rain Storm Simulation */}
      <canvas ref={canvasRef} className={styles.rainCanvas} />

      {/* Skip Button */}
      <button className={styles.skipBtn} onClick={handleSkip}>
        SKIP INTRO <SkipForward size={11} style={{ marginLeft: 6, display: 'inline' }} />
      </button>

      <AnimatePresence mode="wait">
        {showHUD && (
          <motion.div
            key="hud-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}
          >
            {/* Scanline bar moving */}
            <div className={styles.scanlineBar} />

            {/* Pulsing Alert Banner */}
            {showAlert && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={styles.hudWarningAlert}
              >
                <ShieldAlert size={16} color="#ff3b30" />
                <span className={styles.hudWarningAlertText}>FLOOD INFERENCE IN PROGRESS – EXTREME RUNOFF WARNING</span>
              </motion.div>
            )}

            {/* Radar Sweep HUD */}
            <div className={styles.radarContainer} style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className={styles.radarSweep} />
              <div className={`${styles.radarCircle} ${styles.radarCircle1}`} />
              <div className={`${styles.radarCircle} ${styles.radarCircle2}`} />
              <div className={`${styles.radarCircle} ${styles.radarCircle3}`} />
              <div className={styles.crosshairX} />
              <div className={styles.crosshairY} />

              {/* City Grid SVG drawing inside radar */}
              <svg className={styles.cityGridOutline} viewBox="0 0 500 500">
                {/* Coastline */}
                <path d="M 50,450 C 150,410 200,280 300,220 T 450,50" fill="none" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="2.5" />
                {/* Coastline ripple */}
                <path d="M 60,460 C 160,420 210,290 310,230 T 460,60" fill="none" stroke="rgba(0, 212, 255, 0.15)" strokeWidth="1" />
                
                {/* Grid Streets */}
                <path d="M 120,50 L 120,450 M 220,50 Q 240,220 200,450 M 340,50 L 390,450" fill="none" className={styles.cityGridGridPath} />
                <path d="M 50,130 L 450,150 M 50,290 Q 240,310 450,270 M 50,380 L 450,360" fill="none" className={styles.cityGridGridPath} />

                {/* Highlighted Risk Zones (flashing red and orange under warnings) */}
                {showAlert && (
                  <>
                    {/* Poorna Market Zone (Red Alert) */}
                    <motion.path
                      d="M 220,290 L 340,270 L 390,360 L 200,380 Z"
                      fill="rgba(255, 59, 48, 0.25)"
                      stroke="#ff3b30"
                      strokeWidth="2"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {/* Gajuwaka Zone (Orange Alert) */}
                    <motion.path
                      d="M 120,130 L 220,135 L 240,220 L 120,290 Z"
                      fill="rgba(255, 149, 0, 0.2)"
                      stroke="#ff9500"
                      strokeWidth="1.5"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                    />
                  </>
                )}

                {/* Blinking Data Node Markers */}
                <circle cx="120" cy="130" r="4" fill="#00d4ff" />
                <circle cx="220" cy="290" r="4" fill="#00d4ff" />
                <motion.circle 
                  cx="340" 
                  cy="270" 
                  r="6" 
                  fill="#ff3b30" 
                  animate={{ r: [3, 9, 3], opacity: [0.2, 0.9, 0.2] }} 
                  transition={{ duration: 1.2, repeat: Infinity }} 
                />
                <motion.circle 
                  cx="240" 
                  cy="220" 
                  r="5" 
                  fill="#ff9500" 
                  animate={{ r: [3, 7, 3], opacity: [0.3, 0.8, 0.3] }} 
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} 
                />
              </svg>
            </div>

            {/* Diagnostic Terminal Logger */}
            <div className={styles.hudDataBox}>
              <div className={styles.hudDataBoxHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Terminal size={12} />
                  <span>DIAGNOSTIC CORE LOGS</span>
                </div>
                <span className={styles.terminalLogLineGreen}>SYS_UP</span>
              </div>
              <div style={{ maxHeight: 160, overflowY: 'hidden' }}>
                {logs.map((log, index) => {
                  let styleClass = styles.terminalLogLine;
                  if (log.type === 'success') styleClass += ` ${styles.terminalLogLineGreen}`;
                  if (log.type === 'warning') styleClass += ` ${styles.terminalLogLineOrange}`;
                  if (log.type === 'danger') styleClass += ` ${styles.terminalLogLineDanger || ''}`; // CSS handles danger
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={styleClass}
                      style={{ color: log.type === 'danger' ? '#ff3b30' : undefined }}
                    >
                      {log.text}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {showLogo && (
          <motion.div
            key="logo-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={styles.brandContainer}
          >
            {/* Glow logo shield vector draw */}
            <div className={styles.logoGlowRing}>
              <svg viewBox="0 0 100 120" style={{ width: 130, height: 130 }}>
                {/* Shield Path Outline */}
                <motion.path
                  d="M 50 15 C 80 15, 90 20, 95 30 C 95 60, 85 90, 50 105 C 15 90, 5 60, 5 30 C 10 20, 20 15, 50 15 Z"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />

                {/* Dynamic Radiating Waves */}
                <motion.path
                  d="M 32 35 C 44 26, 56 26, 68 35"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.65)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.6 }}
                />
                <motion.path
                  d="M 24 28 C 41 15, 59 15, 76 28"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.35)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.9 }}
                />

                {/* Droplet in Center */}
                <motion.path
                  d="M 50 42 C 50 42, 63 56, 63 68 C 63 75, 57 81, 50 81 C 43 81, 37 75, 37 68 C 37 56, 50 42, 50 42 Z"
                  fill="url(#logoDropletGrad)"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.8 }}
                  style={{ originX: '50px', originY: '68px' }}
                />

                <defs>
                  <linearGradient id="logoDropletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#0066ff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* AquaSentinel Name Reveal */}
            <motion.h1
              initial={{ letterSpacing: '0.05em', opacity: 0, y: 15 }}
              animate={{ letterSpacing: '0.22em', opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
              className={styles.logoTitle}
            >
              AquaSentinel
            </motion.h1>

            {/* Sub-label tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.85, y: 0 }}
              transition={{ duration: 1.0, delay: 1.2 }}
              className={styles.logoSubtitle}
            >
              Urban Flood Early Warning &amp; Response Support
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
