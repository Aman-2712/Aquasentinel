'use client';
import AuthGuard from '@/components/layout/AuthGuard';
import { LoginForm } from '@/components/LoginForm';

/**
 * /farmer/login  -- Farmer-role login page.
 * AuthGuard redirects already-logged-in farmers straight to /farmer/dashboard.
 */
export default function FarmerLoginPage() {
  return (
    <AuthGuard expectedRole="farmer">
      <LoginForm lockedRole="farmer" />
    </AuthGuard>
  );
}
