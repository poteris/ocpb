import { PromptWithDetails, PromptWithDetailsSchema } from "@/types/prompt";
import { z } from "zod";
import { NextResponse } from "next/server";
import { DatabaseError, isDatabaseError } from "@/utils/errors";

async function getSystemPrompts(): Promise<PromptWithDetails[]> {
  const { data, error } = await supabase.from("system_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching system prompts:", error);
    throw new DatabaseError("Error fetching system prompts", "getSystemPrompts", error);
  }
  const validationResult = z.array(PromptWithDetailsSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating system prompts data:", validationResult.error);
    throw new DatabaseError("Error validating system prompts data", "getSystemPrompts", validationResult.error);
  }
  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getSystemPrompts();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (isDatabaseError(error)) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error("Internal server error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}