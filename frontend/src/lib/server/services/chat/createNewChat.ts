'use server'
import { Persona } from "@/types/persona";
import { getConversationContext, getSystemPrompt, saveMessages, upsertPersona, insertConversation} from "@/lib/server/db";
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
  systemPromptId = 1,
}: CreateNewChatRequest) {
  try {
    if (!userId || !scenarioId || !persona) {
      throw new Error("Missing userId, scenarioId, or persona");
    }

    // inserts a persona if does not exist or throws an error 
    await upsertPersona(persona);




    // TODO: remove if adding default to the function signature works
    // if (!systemPromptId) {
    //   const { data: defaultPrompt, error: defaultPromptError } = await supabase
    //     .from("system_prompts")
    //     .select("id")
    //     .single();

    //   if (defaultPromptError) {
    //     console.error("Error fetching default prompt:", defaultPromptError);
    //     throw defaultPromptError;
    //   }
    //   systemPromptId = defaultPrompt.id;
    // }

    const conversationId = uuidv4();
    // Create conversation with system_prompt_id
    await insertConversation(conversationId, userId, scenarioId, persona.id, systemPromptId);

    
    let aiResponse = null;
    if (initialMessage) {
      try {
        // Get the conversation context first
        const { scenario } = await getConversationContext(conversationId);

        // Get and fill the system prompt template
        const systemPromptTemplate = await getSystemPrompt(systemPromptId || 1);
        const basePrompt = await createBasePromptForMessage(
          persona,
          scenario,
          systemPromptTemplate
        );
    

        const messages: OpenAI.ChatCompletionMessageParam[] = [
          { role: "system", content: basePrompt },
          { role: "user", content: initialMessage},
        ]

        aiResponse = await getAIResponse(messages);
        await saveMessages(conversationId, initialMessage, aiResponse || "");
      } catch (error) {
        console.error("Error processing initial message:", error);
        aiResponse =
          "I apologise, but I'm having trouble responding right now. Could you please try again?";
      }
    }

    return { id: conversationId, aiResponse };
  } catch (error) {
    console.error("Error in createConversation:", error);
    throw error;
  }
}
