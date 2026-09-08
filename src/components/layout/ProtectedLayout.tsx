'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD, ROLE_LOGIN, UserRole } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import AIConditionMonitor from '@/components/ai/AIConditionMonitor';
import { Droplets } from 'lucide-react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const loginPath = requiredRole ? ROLE_LOGIN[requiredRole] : '/citizen/login';
        router.replace(loginPath);
        return;
      }

      // Only redirect if the role is definitively wrong AND it's not a fresh login
      // (fresh logins briefly have user=null before saveUserSession fires)
      if (requiredRole && user.role && user.role !== requiredRole) {
        // Give it a tick — if login() just fired, the role may update immediately after
        const timer = setTimeout(() => {
          // Re-check after the tick in case role just updated
          const stored = typeof window !== 'undefined' ? localStorage.getItem('aquasentinel_user') : null;
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.role === requiredRole) return; // role just updated, stay
            } catch (e) {}
          }
          console.warn(`Role mismatch: '${user.role}' vs required '${requiredRole}'. Redirecting.`);
          const correctDashboard = ROLE_DASHBOARD[user.role] || '/citizen/dashboard';
          router.replace(correctDashboard);
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)', color: '#ffffff' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        {children}
      </div>
      <AIConditionMonitor />
    </div>
  );
}