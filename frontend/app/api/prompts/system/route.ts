import { PromptWithDetails, PromptWithDetailsSchema } from "@/types/prompt";
import { z } from "zod";
import { NextResponse } from "next/server";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";

async function getSystemPrompts(): Promise<PromptWithDetails[]> {
  const { data, error } = await supabase.from("system_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching system prompts:", error);
    throw new DatabaseError("Error fetching system prompts", "getSystemPrompts", DatabaseErrorCodes.Select, {
      error,
    });
  }
  const validationResult = z.array(PromptWithDetailsSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating system prompts data:", validationResult.error);
    throw new DatabaseError("Error validating system prompts data", "getSystemPrompts", DatabaseErrorCodes.Select, {
      error: validationResult.error.format()  ,
    });
  }
  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getSystemPrompts();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET system prompts:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}