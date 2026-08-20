'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'farmer' | 'authority';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  sendOTP: (identifier: string, type: 'email' | 'phone') => Promise<void>;
  verifyOTP: (otp: string, identifier: string, type: 'email' | 'phone') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Mock mode: check localStorage for saved session
      const stored = localStorage.getItem('aquasentinel_user');
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
      return;
    }

    // Real Supabase mode: Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'citizen',
          avatar: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'citizen',
          avatar: session.user.user_metadata?.avatar_url,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const saveMockUser = (u: User) => {
    setUser(u);
    localStorage.setItem('aquasentinel_user', JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1200));
      saveMockUser({ id: 'mock-1', name: email.split('@')[0], email, role: 'citizen' });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split('@')[0],
        email: data.user.email || email,
        role: data.user.user_metadata?.role || 'citizen',
      });
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1500));
      saveMockUser({
        id: 'mock-2',
        name: 'Ravi Kumar',
        email: 'ravi.kumar@gmail.com',
        role: 'citizen',
        avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=00d4ff&color=000',
      });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1200));
      saveMockUser({ id: 'mock-3', name, email, role: role as User['role'] });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    });
    if (error) throw error;
    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.name || name,
        email: data.user.email || email,
        role: data.user.user_metadata?.role || (role as User['role']),
      });
    }
  };

  const sendOTP = async (identifier: string, type: 'email' | 'phone') => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1000));
      return;
    }

    if (type === 'email') {
      const { error } = await supabase.auth.signInWithOtp({ email: identifier });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signInWithOtp({ phone: identifier });
      if (error) throw error;
    }
  };

  const verifyOTP = async (otp: string, identifier: string, type: 'email' | 'phone') => {
    if (!isSupabaseConfigured) {
      await new Promise(r => setTimeout(r, 1000));
      if (type === 'email') {
        saveMockUser({
          id: 'mock-email-otp',
          name: identifier.split('@')[0],
          email: identifier,
          role: 'citizen',
        });
      } else {
        saveMockUser({
          id: 'mock-phone-otp',
          name: 'Phone User',
          email: 'phone-user@example.com',
          role: 'citizen',
        });
      }
      return;
    }

    if (type === 'email') {
      const { data, error } = await supabase.auth.verifyOtp({
        email: identifier,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || identifier.split('@')[0],
          email: data.user.email || identifier,
          role: data.user.user_metadata?.role || 'citizen',
        });
      }
    } else {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: identifier,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Phone User',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'citizen',
        });
      }
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      localStorage.removeItem('aquasentinel_user');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isSupabaseConfigured, login, loginWithGoogle, signup, sendOTP, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
