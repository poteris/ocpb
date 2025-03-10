import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { supabase } from "../../init";
import {DatabaseError, DatabaseErrorCodes} from "@/utils/errors";

async function updatePrompt(id: number, type: "system" | "feedback" | "persona", content: string) {
  const { error } = await supabase.from(`${type}_prompts`).update({ content }).eq("id", id);
  if (error) {
    throw new DatabaseError(`Error updating ${type} prompt`, "update_prompt", DatabaseErrorCodes.Update, {
      error
    });
  }
}

const UpdatePromptRequestSchema = z.object({
  type: z.enum(["system", "feedback", "persona"]),
  content: z.string().min(1, "Content cannot be empty"),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = parseInt((await params).id, 10);
    if (isNaN(id)) {
      console.error("Invalid ID for update prompt");
      throw new Error("Invalid ID");
    }

    const body = await req.json().catch((error: unknown) => {
      console.error("Error parsing request body", error);
      throw new Error("Invalid request");
    });

    const validatedRequest = UpdatePromptRequestSchema.safeParse(body);
    if (!validatedRequest.success) {
      console.error("Validation error for update prompt", validatedRequest.error);
      throw new Error("Invalid request");
    }
    await updatePrompt(id, validatedRequest.data.type, validatedRequest.data.content);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
