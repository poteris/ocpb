
import { PromptData, PromptDataSchema } from "@/types/prompt";
import { NextResponse } from "next/server";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

async function getFeedbackPrompts(): Promise<PromptData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("feedback_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    const dbError = new DatabaseError("Error fetching latest feedback prompt", "getLatestFeedbackPrompt", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
  
  const validationResult = z.array(PromptDataSchema).safeParse(data);
  if (!validationResult.success) {
    console.error ("Error validating feedback prompt data:", validationResult.error);
    throw new Error ("Error validating feedback prompt data", { cause: validationResult.error });
  }
  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getFeedbackPrompts();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET latest feedback prompt:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}