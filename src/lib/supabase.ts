import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Only throw in production or if needed. For now just warn or let it fail gracefully if keys are missing during setup.
    console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
