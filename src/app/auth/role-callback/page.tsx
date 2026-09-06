'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { ROLE_DASHBOARD, UserRole } from '@/context/AuthContext';

export default function RoleCallbackPage() {
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleRoleCallback() {
      const pendingRole = (sessionStorage.getItem('aquasentinel_selected_role') ||
        localStorage.getItem('aquasentinel_saved_role') ||
        'citizen') as UserRole;

      sessionStorage.removeItem('aquasentinel_selected_role');

      if (!isSupabaseConfigured) {
        const dest = ROLE_DASHBOARD[pendingRole] || '/citizen/dashboard';
        router.replace(dest);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error('No authenticated session after OAuth:', sessionError);
          router.replace('/citizen/login');
          return;
        }

        const user = session.user;
        const targetRole = pendingRole || 'citizen';

        // Upsert user profile in Supabase profiles table
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            role: targetRole,
          },
          { onConflict: 'id' }
        );

        localStorage.setItem('aquasentinel_saved_role', targetRole);

        const destination = ROLE_DASHBOARD[targetRole] || '/citizen/dashboard';
        router.replace(destination);
      } catch (err) {
        console.error('Error during role callback redirect:', err);
        router.replace('/citizen/dashboard');
      }
    }

    handleRoleCallback();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040d1f' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(0,212,255,0.1)', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}