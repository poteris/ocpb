import { supabase } from "@/lib/init";
export async function updatePrompt(
  type: "system" | "feedback" | "persona",
  id: number,
  content: string,
): Promise<void> {
  const { error } = await supabase.from(`${type}_prompts`).update({ content }).eq("id", id);

  if (error) {
    console.error(`Error updating ${type} prompt:`, error);
    throw error;
  }
}
