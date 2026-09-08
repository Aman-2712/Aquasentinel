'use client';
import { Shield, Droplets } from 'lucide-react';

interface AppLoaderProps {
  message?: string;
}

export default function AppLoader({ message = 'Initializing AquaSentinel Flood Intelligence Engine...' }: AppLoaderProps) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0a182c 0%, #030914 100%)',
      gap: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Outer ambient glow */}
      <div style={{
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: 'rgba(0, 214, 255, 0.08)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      {/* Futuristic Glowing Emblem Container */}
      <div style={{
        position: 'relative',
        width: 90,
        height: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Animated Radar Pulse Ring 1 */}
        <div style={{
          position: 'absolute',
          inset: -12,
          borderRadius: '50%',
          border: '2px solid rgba(0, 214, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 214, 255, 0.3)',
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
        }} />

        {/* Outer Rotating Shield Border Ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(0, 214, 255, 0.4), rgba(0, 102, 255, 0.1))',
          border: '1px solid #00d4ff',
          boxShadow: '0 0 25px rgba(0, 214, 255, 0.5), inset 0 0 15px rgba(0, 214, 255, 0.2)',
          transform: 'rotate(45deg)',
          animation: 'float 3s ease-in-out infinite'
        }} />

        {/* Central AquaSentinel Shield & Water Icon */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Shield size={38} color="#00d4ff" fill="rgba(0,214,255,0.2)" />
          <Droplets size={20} color="#ffffff" style={{ position: 'absolute', top: 9 }} />
        </div>
      </div>

      {/* Brand & Loading Status */}
      <div style={{ textAlign: 'center', zIndex: 2 }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '0.15em',
          color: '#fff',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AQUASENTINEL
        </h2>
        <p style={{
          margin: '0.4rem 0 0 0',
          color: 'var(--clr-text-muted)',
          fontSize: '0.825rem',
          letterSpacing: '0.02em'
        }}>
          {message}
        </p>
      </div>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        @keyframes float {
          0%, 100% { transform: rotate(45deg) translateY(0px); }
          50% { transform: rotate(45deg) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
