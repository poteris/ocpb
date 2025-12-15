'use server'
import { Persona } from "@/types/persona";
import { getConversationContext, getSystemPrompt, saveMessages, upsertPersona, insertConversation, getLatestSystemPromptId, getLatestFeedbackPromptId} from "@/lib/server/db";
import { createBasePromptForMessage, getAIResponse} from "@/lib/server/llm";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";



interface CreateNewChatRequest {
  userId: string;
  initialMessage: string;
  scenarioId: string;
  persona: Persona;
  systemPromptId?: number;
}

export async function createConversation({
  userId,
  initialMessage,
  scenarioId,
  persona,
  systemPromptId,
}: CreateNewChatRequest) {
  try {
    if (!userId || !scenarioId || !persona) {
      throw new Error("Missing userId, scenarioId, or persona");
    }

    // inserts a persona if does not exist or throws an error 
    await upsertPersona(persona);

    // Get the latest prompt IDs if not provided (prompts are shared across organisations)
    const latestSystemPromptId = systemPromptId || await getLatestSystemPromptId();
    const latestFeedbackPromptId = await getLatestFeedbackPromptId();

    const conversationId = uuidv4();
    // Create conversation with latest prompt IDs
    await insertConversation(conversationId, userId, scenarioId, persona.id, latestSystemPromptId, latestFeedbackPromptId);

    
    let aiResponse = null;
    const messageToSend = initialMessage || "Hi";
    try {
      // Get the conversation context first
      const { scenario } = await getConversationContext(conversationId);

      // Get and fill the system prompt template
      const systemPromptTemplate = await getSystemPrompt(latestSystemPromptId);
      const basePrompt = await createBasePromptForMessage(
        persona,
        scenario,
        systemPromptTemplate
      );
    

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: basePrompt },
        { role: "user", content: messageToSend},
      ]

      aiResponse = await getAIResponse(messages);
      await saveMessages(conversationId, messageToSend, aiResponse || "");
    } catch (error) {
      console.error("Error processing initial message:", error);
      aiResponse =
        "I apologise, but I'm having trouble responding right now. Could you please try again?";
    }

    return { id: conversationId, aiResponse };
  } catch (error) {
    console.error("Error in createConversation:", error);
    throw error;
  }
}
