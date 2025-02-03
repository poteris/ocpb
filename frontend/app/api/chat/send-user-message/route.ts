import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/init";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const userMessageResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  sender: z.string(),
});

const sendUserMessageRequestSchema = z.object({
  conversationId: z.string(),
  content: z.string(),
  scenario_id: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsedBody = sendUserMessageRequestSchema.parse(body);

    const { data, error } = await supabase.functions.invoke("assistant", {
      body: JSON.stringify({
        action: "sendMessage",
        ...parsedBody,
      }),
    });

    if (error || !data) {
      console.error("Error invoking assistant function:", error);
      return NextResponse.json({ error: "Failed to get a message from LLM" }, { status: 500 });
    }

    const llmMessage = { id: uuid(), text: data.result.content, sender: "bot" };

    const parsedResponse = userMessageResponseSchema.parse(llmMessage);

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json({ error: "Failed to create new chat" }, { status: 500 });
  }
}
