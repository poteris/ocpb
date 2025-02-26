"use server";
import { createClient } from "@supabase/supabase-js";



export async function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY; 
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function getUsers() {
  const supabase = await getSupabaseClient();
  
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
  
  return data;
}