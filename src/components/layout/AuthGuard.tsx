'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Droplets } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps auth pages (login, signup, otp-verify).
 * If user is already logged in, redirects them to /dashboard.
 */
export default function AuthGuard({ children }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

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

  // Already logged in — redirect happening, show nothing
  if (user) return null;

  return <>{children}</>;
}
