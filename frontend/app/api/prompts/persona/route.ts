import { PromptData, PromptDataSchema } from "@/types/prompt";
import { supabase } from "../../init";
import { z } from "zod";
import { NextResponse } from "next/server";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";

async function getPersonaPrompts(): Promise<PromptData[]> {
  const { data, error } = await supabase.from("persona_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    const dbError = new DatabaseError("Error fetching persona prompts", "getPersonaPrompts", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  const validationResult = z.array(PromptDataSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating persona prompts data:", validationResult.error);
    throw new Error ("Error validating persona prompts data", { cause: validationResult.error.format() });
  }

  return validationResult.data;
}

export async function GET() {
  try {
    const result = await getPersonaPrompts();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET persona prompts:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
