import { PromptData, PromptDataSchema } from "@/types/prompt";
import { Result, err, ok } from "@/types/result";
import { getSupabaseClient } from "@/lib/server/initSupabase";

import { z } from "zod";
import { NextResponse } from "next/server";

async function getPersonaPrompts(): Promise<Result<PromptData[], string>> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from("persona_prompts").select("*").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching persona prompts:", error);
    return err(error.message);
  }

  const validationResult = z.array(PromptDataSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating persona prompts data:", validationResult.error);
    return err("Error validating data");
  }

  return ok(validationResult.data);
}

export async function GET() {
  const result = await getPersonaPrompts();

  if (!result.isOk) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json(result.value, { status: 200 });
}
