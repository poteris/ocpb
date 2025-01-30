import { NextRequest, NextResponse } from "next/server";
import { Persona, personaSchema } from "@/types/persona";
import { supabase } from "@/lib/supabaseClient";
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
    console.log(body);

    const parsedBody = createNewChatRequestSchema.parse(body);

    const { data, error } = await supabase.functions.invoke("assistant", {
      body: JSON.stringify({
        action: "createConversation",
        ...parsedBody,
      }),
    });

    if (error || !data) {
      console.error("Error invoking assistant function:", error);
      return NextResponse.json(
        { error: "Failed to create new chat" },
        { status: 500 }
      );
    }

    const {result} = data;
    const parsedResponse = conversationResponseSchema.parse(result);

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json(
      { error: "Failed to create new chat" },
      { status: 500 }
    );
  }
}
