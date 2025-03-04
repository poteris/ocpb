'use server'
import { conversationDataSchema, messageDataSchema, MessageData } from "@/types/feedback";
import { getFeedbackPrompt as getFeedbackPromptFromDb, getConversationById } from "@/lib/server/db";

type FeedbackPrompt = {
  content: string;
};

export async function getFeedbackPrompt(conversationId: string): Promise<string> {
  try {
    // Fetch conversation (including scenario, persona, messages) and feedback prompt in parallel
    const [conversationResult, feedbackPromptResult] = await Promise.all([
      getConversationById(conversationId),
      getFeedbackPromptFromDb(),
    ]);

    if (conversationResult.error || feedbackPromptResult.error) {
      throw new Error(
        `Error fetching data: ${conversationResult.error?.message || feedbackPromptResult.error?.message}`
      );
    }
    // console.log("conversationResult", conversationResult.data);

    const conversation = await conversationDataSchema.parse(conversationResult);
    const feedbackPrompt = await feedbackPromptResult.data as FeedbackPrompt;

    if (!feedbackPrompt?.content) {
      throw new Error("Feedback prompt content not found or empty.");
    }

    const messages = (conversation?.messages ?? []).map((msg: unknown) => messageDataSchema.parse(msg));

    const conversationHistory = messages.map((msg: MessageData) => `${msg.role}: ${msg.content}`).join("\n");

    const basePrompt = `
${feedbackPrompt.content}

Scenario: ${conversation.scenario.title}
${conversation.scenario.description}

Persona: ${conversation.persona.name}, ${conversation.persona.age} years old, ${conversation.persona.job}
Personality: ${conversation.persona.personality_traits}
Union Support Conditions: ${conversation.persona.emotional_conditions}

Conversation:
${conversationHistory}

Provide feedback based on the conversation above.
    `;


    return basePrompt.trim();
  } catch (error) {
    console.error("Error generating feedback prompt:", error);
    throw error;
  }
}
