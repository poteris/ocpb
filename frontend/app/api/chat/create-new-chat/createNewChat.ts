import { Persona } from "@/types/persona";
import { getConversationContext, getSystemPrompt, saveMessages, upsertPersona, insertConversation} from "@/lib/db";
import {conversationStarter, createCompletePrompt, getAIResponse} from "@/lib/llm";



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


    // TODO: use uuidv4
    const conversationId = crypto.randomUUID();


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

    // Create conversation with system_prompt_id
    await insertConversation(conversationId, userId, scenarioId, persona.id, systemPromptId);

    
    let aiResponse = null;
    const messageToSend = initialMessage || "Hi";
    try {
      // Get the conversation context first
      const { scenario } = await getConversationContext(conversationId);

      // Get and fill the system prompt template
      const systemPromptTemplate = await getSystemPrompt(systemPromptId || 1);
      const completePrompt = await createCompletePrompt(
        persona,
        scenario,
        systemPromptTemplate
      );
    
      const messages = conversationStarter(completePrompt, messageToSend);

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
