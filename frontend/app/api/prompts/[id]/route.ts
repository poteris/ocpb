import { supabase } from "@/lib/init";
import { NextResponse, NextRequest } from "next/server";
import { Result } from "@/types/result";
import { z } from 'zod';




export async function updatePrompt(
  id: number,
  type: "system" | "feedback" | "persona",
  content: string
): Promise<Result<void>> {
  const { error } = await supabase.from(`${type}_prompts`).update({ content }).eq("id", id);

  if (error) {
    console.error(`Error updating ${type} prompt:`, error);
    return { success: false, error: error.message };
  }

  return { success: true };

}


export const UpdatePromptSchema = z.object({
  type: z.enum(["system", "feedback", "persona"]),
  content: z.string().min(1, "Content cannot be empty"),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    console.warn("Invalid ID:", params.id);
    return NextResponse.json({ error: "Server returned an error" }, { status: 400 });
  }

  const body = await req.json();

  const validatedRequest = UpdatePromptSchema.safeParse(body);
  if (!validatedRequest.success) {
    return NextResponse.json({ error: validatedRequest.error.format() }, { status: 400 });
  }
  const result = await updatePrompt(id, validatedRequest.data.type, validatedRequest.data.content);


  if (!result.success) {
    console.warn("Update failed:", result.error);
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: "Prompt updated" }, { status: 200 });
}
