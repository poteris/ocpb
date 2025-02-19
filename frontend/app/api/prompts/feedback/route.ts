
import { PromptData, PromptDataSchema } from "@/types/prompt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";



async function getFeedbackPrompts(): Promise<PromptData[]> {
  const { data, error } = await supabase.from("feedback_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching feedback prompts:", error);
    throw new DatabaseError("Error fetching feedback prompts", "getFeedbackPrompts", DatabaseErrorCodes.Select, {
      error,
    });
  }
  const validationResult = z.array(PromptDataSchema).safeParse(data);

  if (!validationResult.success) {
    console.error ("Error validating feedback prompts data:", validationResult.error);
    throw new DatabaseError("Error validating feedback prompts data", "getFeedbackPrompts", DatabaseErrorCodes.Select, {
      error: validationResult.error,
    });
  }
  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getFeedbackPrompts();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET feedback prompts:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}