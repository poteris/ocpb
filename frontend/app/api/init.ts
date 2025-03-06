import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
