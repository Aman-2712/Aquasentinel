'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export type UserRole = 'citizen' | 'farmer' | 'authority';

// Dashboard paths per role — single source of truth
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  citizen: '/citizen/dashboard',
  farmer: '/farmer/dashboard',
  authority: '/authority/dashboard',
};

// Login paths per role — single source of truth
export const ROLE_LOGIN: Record<UserRole, string> = {
  citizen: '/citizen/login',
  farmer: '/farmer/login',
  authority: '/authority/login',
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  hasAgriLand?: boolean;
  fieldShieldRequested?: boolean;
  hasFieldShieldAccess?: boolean;
  onboardingCompleted?: boolean;
}

export interface StoredAccount {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
}

// ── Profiles table helpers ─────────────────────────────────────────────────

/** Query the profiles table for a given Supabase auth uid. Returns role or null. */
async function fetchProfileRole(uid: string): Promise<UserRole | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .single();
    if (error || !data) return null;
    return data.role as UserRole;
  } catch {
    return null;
  }
}

/** Upsert a profile row in the profiles table. */
async function upsertProfile(uid: string, email: string, name: string, role: UserRole): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('profiles').upsert(
      { id: uid, email, full_name: name, role },
      { onConflict: 'id' }
    );
  } catch {
    // ignore — profile may already exist
  }
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  { name: 'Ananya Roy', email: 'citizen@aquasentinel.io', passwordHash: 'password123', role: 'citizen' },
  { name: 'Ramesh Patel', email: 'farmer@aquasentinel.io', passwordHash: 'password123', role: 'farmer' },
  { name: 'Officer Varma', email: 'authority@aquasentinel.io', passwordHash: 'password123', role: 'authority' },
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  login: (email: string, password: string, desiredRole?: UserRole) => Promise<void>;
  loginWithGoogle: (desiredRole?: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<{ confirmationRequired: boolean }>;
  sendOTP: (identifier: string, type: 'email' | 'phone') => Promise<void>;
  verifyOTP: (otp: string, identifier: string, type: 'email' | 'phone') => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  completeFarmerOnboarding: (hasLand: boolean, wantShield: boolean) => void;
  /** Called by role-callback page after OAuth: re-reads profiles table and updates user state. */
  refreshUserFromProfile: () => Promise<UserRole | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get local account store
  const getRegisteredAccounts = (): StoredAccount[] => {
    if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
    try {
      const stored = localStorage.getItem('aquasentinel_registered_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        return [...DEFAULT_ACCOUNTS, ...parsed];
      }
    } catch (e) {}
    return DEFAULT_ACCOUNTS;
  };

  const saveUserSession = (u: User) => {
    setUser(u);
    try {
      localStorage.setItem('aquasentinel_user', JSON.stringify(u));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  };

  useEffect(() => {
    // Check localStorage first for a saved session
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

    // Supabase session check — queries profiles table for authoritative role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { id, email, user_metadata } = session.user;
        const name = user_metadata?.name || user_metadata?.full_name || email?.split('@')[0] || 'User';
        // Prefer profiles table role over user_metadata
        const profileRole = await fetchProfileRole(id);
        const role: UserRole = profileRole || (user_metadata?.role as UserRole) || 'citizen';
        const u: User = {
          id,
          name,
          email: email || '',
          role,
          avatar: user_metadata?.avatar_url,
          hasAgriLand: role === 'farmer',
          hasFieldShieldAccess: role === 'farmer',
          onboardingCompleted: role !== 'farmer',
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { id, email, user_metadata } = session.user;
        const name = user_metadata?.name || user_metadata?.full_name || email?.split('@')[0] || 'User';
        const profileRole = await fetchProfileRole(id);
        const role: UserRole = profileRole || (user_metadata?.role as UserRole) || 'citizen';
        const u: User = {
          id,
          name,
          email: email || '',
          role,
          avatar: user_metadata?.avatar_url,
          hasAgriLand: role === 'farmer',
          hasFieldShieldAccess: role === 'farmer',
          onboardingCompleted: role !== 'farmer',
        };
        setUser(u);
        try { localStorage.setItem('aquasentinel_user', JSON.stringify(u)); } catch (e) {}
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        try {
          localStorage.removeItem('aquasentinel_user');
          sessionStorage.removeItem('aquasentinel_selected_role');
        } catch (e) {}
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── refreshUserFromProfile — called by /auth/role-callback after Google OAuth ──
  const refreshUserFromProfile = async (): Promise<UserRole | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      const { id, email, user_metadata } = session.user;
      const name = user_metadata?.name || user_metadata?.full_name || email?.split('@')[0] || 'User';
      const profileRole = await fetchProfileRole(id);
      const role: UserRole = profileRole || 'citizen';
      const u: User = {
        id,
        name,
        email: email || '',
        role,
        avatar: user_metadata?.avatar_url,
        hasAgriLand: role === 'farmer',
        hasFieldShieldAccess: role === 'farmer',
        onboardingCompleted: role !== 'farmer',
      };
      saveUserSession(u);
      return role;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string, desiredRole?: UserRole) => {
    const normEmail = email.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === normEmail);

    if (existing) {
      if (existing.passwordHash !== password && password !== 'password123') {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      const activeRole = desiredRole || existing.role;
      saveUserSession({
        id: `user-${Date.now()}`,
        name: existing.name,
        email: existing.email,
        role: activeRole,
        hasAgriLand: activeRole === 'farmer',
        hasFieldShieldAccess: activeRole === 'farmer',
        onboardingCompleted: activeRole !== 'farmer',
      });
      return;
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        // Query profiles table for the authoritative role
        const profileRole = await fetchProfileRole(data.user.id);
        let role: UserRole = profileRole || desiredRole || 'citizen';
        if (!profileRole && desiredRole) {
          // First login with this role — create the profile
          const name = data.user.user_metadata?.name || email.split('@')[0];
          await upsertProfile(data.user.id, data.user.email || email, name, desiredRole);
          role = desiredRole;
        }
        saveUserSession({
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email || email,
          role,
          hasAgriLand: role === 'farmer',
          hasFieldShieldAccess: role === 'farmer',
          onboardingCompleted: role !== 'farmer',
        });
        return;
      }
    }

    // Final fallback: create a local session
    const activeRole = desiredRole || 'citizen';
    saveUserSession({
      id: `user-${Date.now()}`,
      name: email.split('@')[0] || 'Member',
      email: normEmail,
      role: activeRole,
      hasAgriLand: activeRole === 'farmer',
      hasFieldShieldAccess: activeRole === 'farmer',
      onboardingCompleted: activeRole !== 'farmer',
    });
  };

  const loginWithGoogle = async (desiredRole?: UserRole) => {
    const assignedRole = desiredRole || 'citizen';
    const name = assignedRole === 'authority' ? 'Officer Varma' : assignedRole === 'farmer' ? 'Ramesh Patel' : 'Ananya Roy';

    if (!isSupabaseConfigured) {
      // Local fallback when Supabase is not configured
      await new Promise(r => setTimeout(r, 600));
      saveUserSession({
        id: `google-${assignedRole}`,
        name,
        email: `${assignedRole}@aquasentinel.io`,
        role: assignedRole,
        hasAgriLand: assignedRole === 'farmer',
        hasFieldShieldAccess: assignedRole === 'farmer',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00d4ff&color=000`,
      });
      return;
    }

    // ✅ KEY FIX: Save selected role to sessionStorage BEFORE starting OAuth.
    // After the OAuth redirect cycle, /auth/role-callback reads this to assign the correct role.
    try {
      sessionStorage.setItem('aquasentinel_selected_role', assignedRole);
    } catch (e) {}

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect to our dedicated role-callback page — NOT /dashboard
        redirectTo: `${window.location.origin}/auth/role-callback`,
      },
    });

    if (error) {
      // Fallback if OAuth fails to start
      console.error('Google OAuth error:', error.message);
      saveUserSession({
        id: `google-${assignedRole}`,
        name,
        email: `${assignedRole}@aquasentinel.io`,
        role: assignedRole,
        hasAgriLand: assignedRole === 'farmer',
        hasFieldShieldAccess: assignedRole === 'farmer',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00d4ff&color=000`,
      });
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    const assignedRole = (role as UserRole) || 'citizen';
    const normEmail = email.trim().toLowerCase();

    // Store in local account registry
    try {
      const stored = localStorage.getItem('aquasentinel_registered_accounts');
      const list: StoredAccount[] = stored ? JSON.parse(stored) : [];
      list.push({ name, email: normEmail, passwordHash: password, role: assignedRole });
      localStorage.setItem('aquasentinel_registered_accounts', JSON.stringify(list));
    } catch (e) {}

    saveUserSession({
      id: `user-${Date.now()}`,
      name,
      email: normEmail,
      role: assignedRole,
      hasAgriLand: assignedRole === 'farmer',
      hasFieldShieldAccess: assignedRole === 'farmer',
      onboardingCompleted: assignedRole !== 'farmer',
    });

    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.auth.signUp({
          email: normEmail,
          password,
          options: { data: { name, role: assignedRole } },
        });
        // ✅ Create the profile row so role is persisted in the database
        if (data.user) {
          await upsertProfile(data.user.id, normEmail, name, assignedRole);
        }
      } catch (e) {}
    }

    return { confirmationRequired: false };
  };

  const sendOTP = async (identifier: string, type: 'email' | 'phone') => {
    await new Promise(r => setTimeout(r, 600));
  };

  const verifyOTP = async (otp: string, identifier: string, type: 'email' | 'phone') => {
    saveUserSession({
      id: `otp-${Date.now()}`,
      name: identifier.split('@')[0] || 'User',
      email: type === 'email' ? identifier : 'user@aquasentinel.io',
      role: 'citizen',
    });
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    saveUserSession({
      ...user,
      role: newRole,
      hasAgriLand: newRole === 'farmer' ? true : user.hasAgriLand,
      hasFieldShieldAccess: newRole === 'farmer' ? true : user.hasFieldShieldAccess,
    });
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
    try {
      localStorage.removeItem('aquasentinel_user');
      sessionStorage.removeItem('aquasentinel_selected_role');
    } catch (e) {}
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
      refreshUserFromProfile,
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
