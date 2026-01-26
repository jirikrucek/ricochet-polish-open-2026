import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
    console.warn("⚠️ Supabase Credentials Missing! App is running in offline/read-only placeholder mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file to connect to your database.");
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);
