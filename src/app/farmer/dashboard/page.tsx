'use client';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import FarmerDashboard from '@/components/dashboard/FarmerDashboard';

/**
 * /farmer/dashboard
 * Only accessible by users with role === 'farmer'.
 */
export default function FarmerDashboardPage() {
  return (
    <ProtectedLayout requiredRole="farmer">
      <FarmerDashboard />
    </ProtectedLayout>
  );
}
