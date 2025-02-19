import { PromptData, PromptDataSchema } from "@/types/prompt";
import { supabase } from "@/lib/init";
import { z } from "zod";
import { NextResponse } from "next/server";
import { DatabaseError, DatabaseErrorCodes } from "@/utils/errors";

async function getPersonaPrompts(): Promise<PromptData[]> {
  const { data, error } = await supabase.from("persona_prompts").select("id, content, scenario_id, persona_id, created_at").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching persona prompts:", error);
    throw new DatabaseError("Error fetching persona prompts", "getPersonaPrompts", DatabaseErrorCodes.Select, {
      error,
    });
  }

  const validationResult = z.array(PromptDataSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating persona prompts data:", validationResult.error);
    throw new DatabaseError("Error validating persona prompts data", "getPersonaPrompts", DatabaseErrorCodes.Select, {
      error: validationResult.error.format(),
    });
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
