'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD, ROLE_LOGIN, UserRole } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
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

      if (requiredRole && user.role && user.role !== requiredRole) {
        console.warn(`User role '${user.role}' does not match required role '${requiredRole}'. Redirecting.`);
        const correctDashboard = ROLE_DASHBOARD[user.role] || '/citizen/dashboard';
        router.replace(correctDashboard);
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
    </div>
  );
}