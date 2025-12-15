import { PromptData, PromptDataSchema } from "@/types/prompt";
import { supabaseService as supabase } from "../../service-init";
import { NextResponse } from "next/server";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";

async function getLatestPersonaPrompt(): Promise<PromptData> {
  const { data, error } = await supabase
    .from("persona_prompts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    const dbError = new DatabaseError("Error fetching latest persona prompt", "getLatestPersonaPrompt", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  const validationResult = PromptDataSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating persona prompt data:", validationResult.error);
    throw new Error ("Error validating persona prompt data", { cause: validationResult.error.format() });
  }

  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getLatestPersonaPrompt();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET latest persona prompt:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
