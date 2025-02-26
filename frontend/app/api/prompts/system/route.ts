import { PromptWithDetails, PromptWithDetailsSchema } from "@/types/prompt";
import { z } from "zod";
import { NextResponse } from "next/server";
import { Result, err, ok } from "@/types/result";
import { getSupabaseClient } from "@/lib/server/initSupabase";



async function getSystemPrompts(): Promise<Result<PromptWithDetails[], string>> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from("system_prompts").select("*").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching system prompts:", error);
    return err(error.message);
  }
  const validationResult = z.array(PromptWithDetailsSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating system prompts data:", validationResult.error);
    return err("Error validating data");
  }
  return ok(validationResult.data);
}

export async function GET() {
  const result = await getSystemPrompts();

  if (!result.isOk) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json(result.value, { status: 200 });
}
