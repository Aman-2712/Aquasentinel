'use client';
import AuthGuard from '@/components/layout/AuthGuard';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthGuard>
      <LoginForm />
    </AuthGuard>
  );
}
