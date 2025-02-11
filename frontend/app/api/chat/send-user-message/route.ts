import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/init";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { getConversationContext, saveMessages } from "@/lib/db";
import { createBasePromptForMessage, getAIResponse } from "@/lib/llm";
import OpenAI from "openai";
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

async function sendMessage({ conversationId, content }: { conversationId: string; content: string }) {
  try {
    // Get conversation context
    const { persona, scenario, systemPrompt } = await getConversationContext(conversationId);
    // Get message history
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    // Create a structured prompt that maintains context
    const completePrompt = await createBasePromptForMessage(persona, scenario, systemPrompt);

    // Organise messages with clear context preservation
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      // System message with complete context
      {
        role: "system",
        content: `${completePrompt}\n\nRemember to maintain consistent personality and context throughout the conversation. Previous context: This is message ${
          messagesData.length + 1
        } in the conversation.`,
      },
      // Previous conversation history
      ...messagesData.map((msg) => {
        const message: OpenAI.ChatCompletionMessageParam = {
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        };
        return message;
      }),
      // New user message
      {
        role: "user",
        content: content,
      },
    ];

    const aiResponse: string | null = await getAIResponse(messages);
    if (!aiResponse) {
      throw new Error("Failed to get a message from LLM");
    }
    await saveMessages(conversationId, content, aiResponse);

    return { content: aiResponse };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsedBody = sendUserMessageRequestSchema.parse(body);

    // const { data, error } = await supabase.functions.invoke("assistant", {
    //   body: JSON.stringify({
    //     action: "sendMessage",
    //     ...parsedBody,
    //   }),
    // });
    const { content, conversationId } = parsedBody;
    const data = await sendMessage({ conversationId, content });

    // the message being sent is always the user message
    const llmMessage = { id: uuid(), text: data.content, sender: "user" };

    const parsedResponse = userMessageResponseSchema.parse(llmMessage);

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json({ error: "Failed to create new chat" }, { status: 500 });
  }
}
