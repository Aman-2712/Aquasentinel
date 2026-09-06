'use client';
import AuthGuard from '@/components/layout/AuthGuard';
import { LoginForm } from '@/components/LoginForm';

/**
 * /authority/login  -- Authority-role login page.
 * AuthGuard redirects already-logged-in authority users straight to /authority/dashboard.
 */
export default function AuthorityLoginPage() {
  return (
    <AuthGuard expectedRole="authority">
      <LoginForm lockedRole="authority" />
    </AuthGuard>
  );
}
