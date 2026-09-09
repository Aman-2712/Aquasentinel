'use client';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import CitizenDashboardV2 from '@/components/dashboard/CitizenDashboardV2';

/**
 * /citizen/dashboard — V2 light glassmorphism UI (local test only, NOT pushed)
 */
export default function CitizenDashboardPage() {
  return (
    <ProtectedLayout requiredRole="citizen">
      <CitizenDashboardV2 />
    </ProtectedLayout>
  );
}
