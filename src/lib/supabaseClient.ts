import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Check if credentials are valid and not the placeholder default values
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseAnonKey.startsWith('ey');

// Initialize with safe fallback placeholders to prevent Next.js initialization crashes
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy-project-ref.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key'
);
