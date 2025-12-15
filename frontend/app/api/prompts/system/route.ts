import { PromptWithDetails, PromptWithDetailsSchema } from "@/types/prompt";
import { NextResponse } from "next/server";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";
import { supabaseService as supabase } from "../../service-init";

async function getLatestSystemPrompt(): Promise<PromptWithDetails> {
  const { data, error } = await supabase
    .from("system_prompts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    const dbError = new DatabaseError("Error fetching latest system prompt", "getLatestSystemPrompt", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
  
  const validationResult = PromptWithDetailsSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating system prompt data:", validationResult.error);
    throw new DatabaseError("Error validating system prompt data", "getLatestSystemPrompt", DatabaseErrorCodes.Select, {
      error: validationResult.error.format(),
    });
  }
  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getLatestSystemPrompt();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET latest system prompt:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}