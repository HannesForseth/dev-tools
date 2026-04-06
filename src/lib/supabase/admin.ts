import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
// Used for webhook handlers and API key validation (bypasses RLS)
// Lazy-initialized to avoid build-time errors when env vars aren't set

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable"
    );
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return _client;
}
