import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables for service role");
}

// Service role client for admin tasks. Must target the same schema as the
// cookie-based client in @/utils/supabase/server, or reads and writes would
// land in different schemas on deployments that set SUPABASE_SCHEMA.
export const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: process.env.SUPABASE_SCHEMA || "public" },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
