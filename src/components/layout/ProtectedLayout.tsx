'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { Droplets } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Full-page loader while checking auth
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--clr-bg)',
        gap: '1rem',
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          animation: 'float 2s ease-in-out infinite',
        }}>
          <Droplets size={28} />
        </div>
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>Loading AquaSentinel...</p>
      </div>
    );
  }

  // Redirect happening — show nothing to avoid flash
  if (!user) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
