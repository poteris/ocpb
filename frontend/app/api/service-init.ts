import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseService: SupabaseClient | null = null;

function getSupabaseService(): SupabaseClient {
  if (_supabaseService) {
    return _supabaseService;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for service role");
  }

  // Service role client for storage operations and admin tasks
  _supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return _supabaseService;
}

// Export as a getter that lazily initializes the client
export const supabaseService = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseService()[prop as keyof SupabaseClient];
  }
});
