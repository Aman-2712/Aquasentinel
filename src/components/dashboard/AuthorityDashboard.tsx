'use client';
import { useAuth } from '@/context/AuthContext';
import { Lock } from 'lucide-react';
import ArcticAuthorityStation from '@/components/authority/ArcticAuthorityStation';

export default function AuthorityDashboard() {
  const { user } = useAuth();

  if (user?.role !== 'authority') {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: 20,
          background: 'rgba(0, 214, 255, 0.15)',
          border: '2px solid #00f0ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00f0ff',
          marginBottom: '1.25rem',
          boxShadow: '0 0 24px rgba(0, 214, 255, 0.3)',
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          Restricted Government Portal
        </h2>
        <p style={{ color: 'var(--clr-text-muted)', maxWidth: 460, fontSize: '0.9rem', lineHeight: 1.5 }}>
          Access to the Authority Command Center is strictly limited to authorized disaster response officials and municipal administration.
        </p>
      </div>
    );
  }

  return <ArcticAuthorityStation />;
}
