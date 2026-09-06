'use client';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD, UserRole } from '@/context/AuthContext';
import { Droplets } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  /**
   * If provided, only auto-redirects to dashboard when the logged-in user
   * has THIS exact role. Users with a different role see the login form.
   */
  expectedRole?: UserRole;
}

function GuardContent({ children, expectedRole }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (expectedRole) {
        // Only redirect if the already-logged-in user has the same role as this login page
        if (user.role === expectedRole) {
          router.replace(ROLE_DASHBOARD[user.role]);
        }
        // Different role user: let them see the login form to re-authenticate
      } else {
        // No expectedRole — any authenticated user goes to their own dashboard
        router.replace(ROLE_DASHBOARD[user.role]);
      }
    }
  }, [user, isLoading, router, expectedRole]);

  if (isLoading) {
    return (
      <div
        className="intro-loader-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--clr-bg)',
          gap: '1rem',
        }}
      >
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
        <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
          Loading AquaSentinel...
        </p>
      </div>
    );
  }

  // Redirect in progress — render nothing to avoid flash
  if (user && expectedRole && user.role === expectedRole) return null;
  if (user && !expectedRole) return null;

  return <>{children}</>;
}

export default function AuthGuard({ children, expectedRole }: Props) {
  return (
    <Suspense
      fallback={
        <div
          className="intro-loader-container"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--clr-bg)',
          }}
        >
          <p style={{ color: 'var(--clr-text-muted)' }}>Loading...</p>
        </div>
      }
    >
      <GuardContent expectedRole={expectedRole}>{children}</GuardContent>
    </Suspense>
  );
}