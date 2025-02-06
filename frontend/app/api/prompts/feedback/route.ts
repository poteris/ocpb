import { supabase } from "@/lib/init";
import { PromptData, PromptDataSchema } from "@/types/prompt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Result, err, ok } from "@/types/result";

async function getFeedbackPrompts(): Promise<Result<PromptData[], string>> {
  const { data, error } = await supabase.from("feedback_prompts").select("*").order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching feedback prompts:", error);
    return err("Error fetching feedback prompts");
  }
  const validationResult = z.array(PromptDataSchema).safeParse(data);

  if (!validationResult.success) {
    console.error("Error validating feedback prompts data:", validationResult.error);
    return err("Error validating feedback prompts data");
  }
  return ok(validationResult.data);
}

export async function GET() {
  const result = await getFeedbackPrompts();

  if (!result.isOk) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json(result.value, { status: 200 });
}
