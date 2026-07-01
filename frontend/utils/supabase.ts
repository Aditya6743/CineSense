import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key"

let finalUrl = supabaseUrl;
if (!finalUrl.startsWith('http')) {
  finalUrl = `https://${finalUrl}`;
}

export const supabase = createClient(finalUrl, supabaseAnonKey);
