import { supabase } from "@/lib/init";
import { PromptWithDetails } from "@/types/prompt";
export async function getSystemPrompts(): Promise<PromptWithDetails[]> {
  const { data, error } = await supabase
    .from("system_prompts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching system prompts:", error);
    return [];
  }

  return data;
}
