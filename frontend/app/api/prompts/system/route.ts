import { supabase } from "@/lib/init";
import { PromptWithDetails, PromptWithDetailsSchema } from "@/types/prompt";
import { z } from "zod";
import { NextResponse } from "next/server";
import {Result } from "@/types/result";

export async function getSystemPrompts(): Promise<Result<PromptWithDetails[]>> {
  const { data, error } = await supabase
    .from("system_prompts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching system prompts:", error);
    return { success: false, error: error.message };
  }
  const validationResult = z.array(PromptWithDetailsSchema).safeParse(data);
  if (!validationResult.success) {
    console.error("Error validating system prompts data:", validationResult.error);
    return { success: false, error: "Error validating data" };
  }
  return { success: true, data: validationResult.data };
}


export async function GET() {
  const result = await getSystemPrompts();

  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 200 });

}