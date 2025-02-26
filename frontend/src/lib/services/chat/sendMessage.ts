import { getAIResponse, createBasePromptForMessage } from "@/lib/llm";
import { getConversationContext, saveMessages, getAllChatMessages } from "@/lib/db";
import OpenAI from "openai";

export async function sendMessage({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
  scenarioId?: string;
}) {
  try {
    const { persona, scenario, systemPrompt } = await getConversationContext(conversationId);

    const messagesData = await getAllChatMessages(conversationId);

    if (!persona || !scenario || !systemPrompt || !messagesData) {
      throw new Error("Missing persona, scenario, systemPrompt, or messagesData");
    }

    // Create a structured prompt that maintains context
    const basePrompt = await createBasePromptForMessage(persona, scenario, systemPrompt);
    const instruction = `Remember to maintain consistent personality and context throughout the conversation. Previous context: This is message ${
      messagesData.length + 1
    } in the conversation.`;

    const messages = [
      // System message with context
      {
        role: "system",
        content: `${basePrompt}\n ${instruction}`,
      },
      // append conversation history
      ...messagesData.map((msg: OpenAI.ChatCompletionMessageParam) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: content,
      },
    ] as OpenAI.ChatCompletionMessageParam[];

    const aiResponse = await getAIResponse(messages);
    if (!aiResponse) throw new Error("No response from AI");
    await saveMessages(conversationId, content, aiResponse);

    return { content: aiResponse };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}
