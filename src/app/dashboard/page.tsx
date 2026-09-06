'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DASHBOARD } from '@/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const userRole = user.role || 'citizen';
        const targetDashboard = ROLE_DASHBOARD[userRole] || '/citizen/dashboard';
        router.replace(targetDashboard);
      } else {
        router.replace('/citizen/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040d1f' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}