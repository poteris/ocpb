import { conversationDataSchema, messageDataSchema, MessageData } from "./types";
import { supabase } from "@/lib/init";
import {getFeedbackPrompt as getFeedbackPromptFromDb, getConversationById} from "@/lib/db";


type FeedbackPrompt = {
  content: string;
};

/**
 * Fetches the feedback prompt text for a given conversation.
 *
 * @param conversationId - ID of the conversation.
 * @returns A string containing the complete prompt text.
 */
export async function getFeedbackPrompt(conversationId: string): Promise<string> {
  try {
    // Fetch conversation (including scenario, persona, messages) and feedback prompt in parallel
    const [conversationResult, feedbackPromptResult] = await Promise.all([
      getConversationById(conversationId),
      getFeedbackPromptFromDb(conversationId),
    ]);
 
    if (conversationResult.error || feedbackPromptResult.error) {
      throw new Error(`Error fetching data: ${conversationResult.error?.message || feedbackPromptResult.error?.message}`);
    }

    // Parse and validate using zod
    const conversation = conversationDataSchema.parse(conversationResult.data);
    const feedbackPrompt = feedbackPromptResult.data as FeedbackPrompt;

    if (!feedbackPrompt?.content) {
      throw new Error("Feedback prompt content not found or empty.");
    }

    // Parse messages using zod
    const messages = (conversation?.messages ?? []).map((msg: unknown) =>
      messageDataSchema.parse(msg),
    );

    // Construct the conversation history
    const conversationHistory = messages
      .map((msg: MessageData) => `${msg.role}: ${msg.content}`)
      .join("\n");

    console.log(conversationHistory);
    // Construct the final feedback prompt
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

    console.log(basePrompt);

    return basePrompt.trim();
  } catch (error) {
    console.error("Error generating feedback prompt:", error);
    throw error;
  }
}
