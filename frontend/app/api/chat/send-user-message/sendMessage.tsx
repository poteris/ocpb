import { getAIResponse, createCompletePrompt } from "@/lib/llm";
import { getConversationContext, saveMessages, getAllMessage } from "@/lib/db";
import {MessageToOpenAi} from "@/types/llm";


export async function sendMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
  scenarioId?: string;
}) {
  try {
    // Get conversation context
    const { persona, scenario, systemPrompt } = await getConversationContext(conversationId);

    // Get message history
    const messagesData = await getAllMessage(conversationId);

    if (!persona || !scenario || !systemPrompt || !messagesData) {
      throw new Error("Missing persona, scenario, systemPrompt, or messagesData");
    }

    // Create a structured prompt that maintains context
    const completePrompt = await createCompletePrompt(persona, scenario, systemPrompt);

    // Organise messages with clear context preservation
    const messages = [
      // System message with complete context
      {
        role: "system",
        content: `${completePrompt}\n\nRemember to maintain consistent personality and context throughout the conversation. Previous context: This is message ${messagesData.length + 1} in the conversation.`,
      },
      // Previous conversation history
      ...messagesData.map((msg: MessageToOpenAi) => ({
        role: msg.role,
        content: msg.content,
      })),
      // New user message
      {
        role: "user",
        content: content,
      },
    ];

    const aiResponse = await getAIResponse(messages);
    if (!aiResponse) throw new Error("No response from AI");
    await saveMessages(conversationId, content, aiResponse);

    return { content: aiResponse };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}
