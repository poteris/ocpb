import { PromptData } from "@/types/prompt";
import { supabase } from "@/lib/init";

export async function getPersonaPrompts(): Promise<PromptData[]> {
  const { data, error } = await supabase
    .from("persona_prompts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching persona prompts:", error);
    return [];
  }

  return data;
}
