import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-supabase-anon-key') &&
  !supabaseAnonKey.includes('placeholder')
);

if (typeof window !== 'undefined') {
  console.log('[Supabase Environment Diagnostic]', {
    supabaseUrl,
    hasSupabaseKey: Boolean(supabaseAnonKey),
    keyLooksPlaceholder:
      !supabaseAnonKey ||
      supabaseAnonKey.includes('placeholder') ||
      supabaseAnonKey.includes('your-supabase')
  });
}

// Safe fallback client to prevent runtime initialization crashes when env vars are missing
const activeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const activeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

