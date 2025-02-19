import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import {ApiError, ApiErrorCodes, DatabaseError, DatabaseErrorCodes} from "@/utils/errors";

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
      throw new ApiError('Invalid ID', 'update_prompt', ApiErrorCodes.InvalidRequest, {
        id,
      });
    }

    const body = await req.json().catch((error: unknown) => {
      throw new ApiError('Invalid request', 'update_prompt', ApiErrorCodes.InvalidRequest, {
        error,
        body: req.body,
      });
    });

    const validatedRequest = UpdatePromptRequestSchema.safeParse(body);
    if (!validatedRequest.success) {
      throw new ApiError('Invalid request', 'update_prompt', ApiErrorCodes.InvalidRequest, {
        error: validatedRequest.error.format(),
      });
    }
    await updatePrompt(id, validatedRequest.data.type, validatedRequest.data.content);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
