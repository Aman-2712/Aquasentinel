'use client';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import AuthorityDashboard from '@/components/dashboard/AuthorityDashboard';

/**
 * /authority/dashboard
 * Only accessible by users with role === 'authority'.
 */
export default function AuthorityDashboardPage() {
  return (
    <ProtectedLayout requiredRole="authority">
      <AuthorityDashboard />
    </ProtectedLayout>
  );
}
