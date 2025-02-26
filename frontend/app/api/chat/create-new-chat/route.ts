import { NextRequest, NextResponse } from "next/server";
import { personaSchema } from "@/types/persona";
import { createConversation } from "@/lib/server/services/chat/createNewChat";
import { z } from "zod";

const createNewChatRequestSchema = z.object({
  userId: z.string(),
  initialMessage: z.string(),
  scenarioId: z.string(),
  persona: personaSchema,
  systemPromptId: z.number().optional(),
});

const conversationResponseSchema = z.object({
  id: z.string(),
  aiResponse: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsedBody = createNewChatRequestSchema.parse(body);

    const response = await createConversation(parsedBody);

    const parsedResponse = conversationResponseSchema.parse(response);

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json({ error: "Failed to create new chat" }, { status: 500 });
  }
}
