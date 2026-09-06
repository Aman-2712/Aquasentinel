'use client';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import CitizenDashboard from '@/components/dashboard/CitizenDashboard';

/**
 * /citizen/dashboard
 * Only accessible by users with role === 'citizen'.
 * ProtectedLayout handles redirect to login if unauthenticated,
 * and to correct dashboard if wrong role.
 */
export default function CitizenDashboardPage() {
  return (
    <ProtectedLayout requiredRole="citizen">
      <CitizenDashboard />
    </ProtectedLayout>
  );
}
