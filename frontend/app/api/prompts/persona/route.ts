import { PromptData, PromptDataSchema } from "@/types/prompt";
import {Result } from "@/types/result";
import { supabase } from "@/lib/init";
import { z } from "zod";
import { NextResponse } from "next/server";

export async function getPersonaPrompts(): Promise<Result<PromptData[]>> {
  const { data, error } = await supabase
    .from("persona_prompts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching persona prompts:", error);
    return { success: false, error: error.message };
  }

  const validationResult = z.array(PromptDataSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating persona prompts data:", validationResult.error);
    return { success: false, error: "Error validating data" };
  }

  return { success: true, data: validationResult.data };
}


export async function GET() {
  const result = await getPersonaPrompts();

  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 200 });
}
