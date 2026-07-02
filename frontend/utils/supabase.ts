import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key"

let supabase: any;
try {
  let finalUrl = supabaseUrl;
  if (!finalUrl.startsWith('http')) {
    finalUrl = `https://${finalUrl}`;
  }
  supabase = createClient(finalUrl, supabaseAnonKey);
} catch (e) {
  console.error("Failed to initialize Supabase client:", e);
  // Provide a robust dummy proxy so the app doesn't crash on load
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: e }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ data: null, error: e }),
      signOut: async () => ({ error: null })
    }
  };
}

export { supabase };
