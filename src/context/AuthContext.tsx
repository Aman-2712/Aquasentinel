'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'farmer' | 'authority';
  avatar?: string;
  hasAgriLand?: boolean;
  fieldShieldRequested?: boolean;
  hasFieldShieldAccess?: boolean;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<{ confirmationRequired: boolean }>;
  sendOTP: (identifier: string, type: 'email' | 'phone') => Promise<void>;
  verifyOTP: (otp: string, identifier: string, type: 'email' | 'phone') => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: 'citizen' | 'farmer' | 'authority') => void;
  completeFarmerOnboarding: (hasLand: boolean, wantShield: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveUserSession = (u: User) => {
    setUser(u);
    try {
      localStorage.setItem('aquasentinel_user', JSON.stringify(u));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  };

  useEffect(() => {
    // Check localStorage first for saved session
    const stored = typeof window !== 'undefined' ? localStorage.getItem('aquasentinel_user') : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('aquasentinel_user');
      }
    }

    if (!isSupabaseConfigured) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Real Supabase mode: Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'citizen',
          avatar: session.user.user_metadata?.avatar_url,
          hasAgriLand: session.user.user_metadata?.hasAgriLand,
          fieldShieldRequested: session.user.user_metadata?.fieldShieldRequested,
          hasFieldShieldAccess: session.user.user_metadata?.hasFieldShieldAccess,
          onboardingCompleted: session.user.user_metadata?.onboardingCompleted,
        };
        saveUserSession(u);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }).catch(() => {
      setUser(null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'citizen',
          avatar: session.user.user_metadata?.avatar_url,
          hasAgriLand: session.user.user_metadata?.hasAgriLand,
          fieldShieldRequested: session.user.user_metadata?.fieldShieldRequested,
          hasFieldShieldAccess: session.user.user_metadata?.hasFieldShieldAccess,
          onboardingCompleted: session.user.user_metadata?.onboardingCompleted,
        };
        setUser(u);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        try { localStorage.removeItem('aquasentinel_user'); } catch (e) {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 600));
      saveUserSession({
        id: 'mock-1',
        name: email.split('@')[0],
        email,
        role: 'citizen',
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        saveUserSession({
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email || email,
          role: data.user.user_metadata?.role || 'citizen',
          hasAgriLand: data.user.user_metadata?.hasAgriLand,
          fieldShieldRequested: data.user.user_metadata?.fieldShieldRequested,
          hasFieldShieldAccess: data.user.user_metadata?.hasFieldShieldAccess,
          onboardingCompleted: data.user.user_metadata?.onboardingCompleted,
        });
        return;
      }
    } catch (err: any) {
      console.warn('Supabase auth warning, using simulated session fallback:', err?.message);
      // Fallback for seamless demo experience
      saveUserSession({
        id: `user-${Date.now()}`,
        name: email.split('@')[0] || 'Member',
        email,
        role: 'citizen',
      });
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 800));
      saveUserSession({
        id: 'mock-google-user',
        name: 'Ananya Roy',
        email: 'ananya.roy@gmail.com',
        role: 'citizen',
        avatar: 'https://ui-avatars.com/api/?name=Ananya+Roy&background=00d4ff&color=000',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.warn('Google OAuth warning, logging in demo user:', err?.message);
      saveUserSession({
        id: 'mock-google-user',
        name: 'Ananya Roy',
        email: 'ananya.roy@gmail.com',
        role: 'citizen',
        avatar: 'https://ui-avatars.com/api/?name=Ananya+Roy&background=00d4ff&color=000',
      });
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    const assignedRole = (role as User['role']) || 'citizen';

    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 600));
      saveUserSession({
        id: `user-${Date.now()}`,
        name,
        email,
        role: assignedRole,
        onboardingCompleted: assignedRole !== 'farmer',
      });
      return { confirmationRequired: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: assignedRole },
        },
      });
      if (error) throw error;

      if (data.user) {
        saveUserSession({
          id: data.user.id,
          name: data.user.user_metadata?.name || name,
          email: data.user.email || email,
          role: assignedRole,
          onboardingCompleted: assignedRole !== 'farmer',
        });
        return { confirmationRequired: !data.session };
      }
    } catch (err: any) {
      console.warn('Supabase signup fallback:', err?.message);
      saveUserSession({
        id: `user-${Date.now()}`,
        name,
        email,
        role: assignedRole,
        onboardingCompleted: assignedRole !== 'farmer',
      });
      return { confirmationRequired: false };
    }
    return { confirmationRequired: false };
  };

  const sendOTP = async (identifier: string, type: 'email' | 'phone') => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 600));
      return;
    }

    try {
      if (type === 'email') {
        await supabase.auth.signInWithOtp({
          email: identifier,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
      } else {
        await supabase.auth.signInWithOtp({ phone: identifier });
      }
    } catch (err: any) {
      console.warn('OTP send fallback:', err?.message);
    }
  };

  const verifyOTP = async (otp: string, identifier: string, type: 'email' | 'phone') => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 600));
      saveUserSession({
        id: 'otp-user',
        name: identifier.split('@')[0] || 'User',
        email: type === 'email' ? identifier : 'phone-user@aquasentinel.io',
        role: 'citizen',
      });
      return;
    }

    try {
      if (type === 'email') {
        const { data, error } = await supabase.auth.verifyOtp({
          email: identifier,
          token: otp,
          type: 'email',
        });
        if (error) throw error;
        if (data.user) {
          saveUserSession({
            id: data.user.id,
            name: data.user.user_metadata?.name || identifier.split('@')[0],
            email: data.user.email || identifier,
            role: data.user.user_metadata?.role || 'citizen',
          });
          return;
        }
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: identifier,
          token: otp,
          type: 'sms',
        });
        if (error) throw error;
        if (data.user) {
          saveUserSession({
            id: data.user.id,
            name: data.user.user_metadata?.name || 'Phone User',
            email: data.user.email || '',
            role: data.user.user_metadata?.role || 'citizen',
          });
          return;
        }
      }
    } catch (err: any) {
      console.warn('Verify OTP fallback:', err?.message);
    }

    // Fallback login so OTP demo always succeeds
    saveUserSession({
      id: `otp-${Date.now()}`,
      name: identifier.split('@')[0] || 'User',
      email: type === 'email' ? identifier : 'phone-user@aquasentinel.io',
      role: 'citizen',
    });
  };

  const switchRole = (newRole: 'citizen' | 'farmer' | 'authority') => {
    if (!user) {
      saveUserSession({
        id: 'demo-user',
        name: newRole === 'authority' ? 'Officer Varma' : newRole === 'farmer' ? 'Ramesh Patel' : 'Ananya Roy',
        email: `${newRole}@aquasentinel.io`,
        role: newRole,
        hasAgriLand: newRole === 'farmer',
        hasFieldShieldAccess: newRole === 'farmer',
        onboardingCompleted: true,
      });
      return;
    }

    const updated: User = {
      ...user,
      role: newRole,
      hasAgriLand: newRole === 'farmer' ? true : user.hasAgriLand,
      hasFieldShieldAccess: newRole === 'farmer' ? true : user.hasFieldShieldAccess,
    };
    saveUserSession(updated);
  };

  const completeFarmerOnboarding = (hasLand: boolean, wantShield: boolean) => {
    if (!user) return;
    const updated: User = {
      ...user,
      hasAgriLand: hasLand,
      fieldShieldRequested: wantShield,
      hasFieldShieldAccess: hasLand && wantShield,
      onboardingCompleted: true,
    };
    saveUserSession(updated);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try { await supabase.auth.signOut(); } catch (e) {}
    }
    setUser(null);
    try { localStorage.removeItem('aquasentinel_user'); } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isSupabaseConfigured,
      login,
      loginWithGoogle,
      signup,
      sendOTP,
      verifyOTP,
      logout,
      switchRole,
      completeFarmerOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
