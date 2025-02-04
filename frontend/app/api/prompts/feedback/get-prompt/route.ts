import { supabase } from "@/lib/init";
import { PromptData } from "@/types/prompt";
export async function getFeedbackPrompts(): Promise<PromptData[]> {
  const { data, error } = await supabase
    .from("feedback_prompts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching feedback prompts:", error.message, error.details);
    return [];
  }

  return data || [];
}
