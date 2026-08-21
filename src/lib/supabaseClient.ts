import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key' &&
  (supabaseAnonKey.startsWith('ey') || supabaseAnonKey.startsWith('sb_'));

// Use @supabase/supabase-js client (localStorage-based session)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy-project-ref.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.dummy'
);
