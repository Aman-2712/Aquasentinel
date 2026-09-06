'use client';
import AuthGuard from '@/components/layout/AuthGuard';
import { LoginForm } from '@/components/LoginForm';

/**
 * /citizen/login  -- Citizen-role login page.
 * AuthGuard redirects already-logged-in citizens straight to /citizen/dashboard.
 */
export default function CitizenLoginPage() {
  return (
    <AuthGuard expectedRole="citizen">
      <LoginForm lockedRole="citizen" />
    </AuthGuard>
  );
}
