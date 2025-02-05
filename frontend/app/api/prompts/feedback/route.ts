import { supabase } from "@/lib/init";
import { PromptData } from "@/types/prompt";
import { PromptDataSchema } from "@/types/prompt";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function getFeedbackPrompts(): Promise<{
  data: PromptData[] | null;
  error?: string;
}> {
  const { data, error } = await supabase
    .from("feedback_prompts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching feedback prompts:", error);
    return { data: null, error: "Error fetching feedback prompts" };
  }
  const validationResult = z.array(PromptDataSchema).safeParse(data);

  if (!validationResult.success) {
    console.error(
      "Error validating feedback prompts data:",
      validationResult.error
    );
    return { data: null, error: "Error validating feedback prompts data" };
  }
  return { data: validationResult.data };
}

export async function GET() {
  const { data, error } = await getFeedbackPrompts();

  if (error || !data) {
    return NextResponse.json({ message: error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
