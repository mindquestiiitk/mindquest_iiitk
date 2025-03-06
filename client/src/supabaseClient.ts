import { createClient } from "@supabase/supabase-js";

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log error if env variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase environment variables are missing.");
  throw new Error("Supabase environment variables are not defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
