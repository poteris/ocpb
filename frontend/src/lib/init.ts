import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing env.SUPABASE_URL or env.SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

let openaiClient: OpenAI;

if (typeof window === 'undefined') {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export { openaiClient };