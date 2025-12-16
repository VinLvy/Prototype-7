import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

const isUrlValid = (url: string | undefined) => url && url.startsWith('http');

if (!isUrlValid(supabaseUrl) || !supabaseKey) {
    console.warn("Supabase URL or Key is missing or invalid! Check your .env file. (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)");
    console.warn("Current URL value:", supabaseUrl);

    // Mock client to prevent app crash
    supabase = {
        auth: {
            signInWithOtp: () => Promise.resolve({ error: { message: "Supabase configuration missing or invalid (check console)" } })
        }
    } as unknown as SupabaseClient;
} else {
    supabase = createClient(supabaseUrl as string, supabaseKey as string);
}

export default supabase;