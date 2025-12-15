import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { supabaseService as supabase } from "../../service-init";
import {DatabaseError, DatabaseErrorCodes} from "@/utils/errors";

async function createNewPromptVersion(type: "system" | "feedback" | "persona", content: string) {
  const { data, error } = await supabase.from(`${type}_prompts`).insert({ content }).select("id").single();
  if (error) {
    const dbError = new DatabaseError(`Error creating new ${type} prompt version`, "create_prompt_version", DatabaseErrorCodes.Insert, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
  return data.id;
}

const CreatePromptVersionRequestSchema = z.object({
  type: z.enum(["system", "feedback", "persona"]),
  content: z.string().min(1, "Content cannot be empty"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch((error: unknown) => {
      console.error("Error parsing request body", error);
      throw new Error("Invalid request");
    });

    const validatedRequest = CreatePromptVersionRequestSchema.safeParse(body);
    if (!validatedRequest.success) {
      console.error("Validation error for create prompt version", validatedRequest.error);
      throw new Error("Invalid request");
    }
    
    const newPromptId = await createNewPromptVersion(validatedRequest.data.type, validatedRequest.data.content);

    return NextResponse.json({ success: true, id: newPromptId }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
