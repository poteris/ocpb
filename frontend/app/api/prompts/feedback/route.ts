
import { PromptData, PromptDataSchema } from "@/types/prompt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";
import { supabase } from "../../init";



async function getFeedbackPrompts(): Promise<PromptData[]> {
  const { data, error } = await supabase.from("feedback_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    const dbError = new DatabaseError("Error fetching feedback prompts", "getFeedbackPrompts", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
  const validationResult = z.array(PromptDataSchema).safeParse(data);

  if (!validationResult.success) {
    console.error ("Error validating feedback prompts data:", validationResult.error);
    throw new Error ("Error validating feedback prompts data", { cause: validationResult.error });
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