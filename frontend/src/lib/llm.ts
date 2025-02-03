import OpenAI from "openai";
import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";
import { openaiClient } from "@/lib/init";
import Handlebars from "handlebars";
import { MessageToOpenAi } from "@/types/llm";
const llm_model = process.env.LLM_MODEL || "gpt-4o";

/**
 * Sends a series of messages to an AI model and retrieves the response.
 *
 * @param messages - An array of message objects to be sent to the AI model. Each message should have a role and content.
 * @returns string or null - The response from the AI model.
 *
 */
export async function getAIResponse(messages: MessageToOpenAi[]): Promise<string | null> {
  const formattedMessages = messages.map((msg) => ({
    role: msg.role as "user" | "system" | "assistant",
    content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
  }));
  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: formattedMessages,
    model: llm_model,
  };

  const completion = await openaiClient.chat.completions.create(params);
  return completion.choices[0].message.content;
}

/**
 * Creates a complete prompt by processing a Handlebars template with the provided persona and scenario context.
 *
 * @param {Persona} persona - The persona object containing details about the individual.
 * @param {TrainingScenario} scenario - The training scenario object containing details about the scenario.
 * @param {string} systemPrompt - The Handlebars template string to be processed.
 * @returns {Promise<string>} - A promise that resolves to the final processed prompt string.
 *
 * @throws Will log an error message and return the original systemPrompt if an error occurs during template processing.
 */
export async function createCompletePrompt(
  persona: Persona,
  scenario: TrainingScenario,
  systemPrompt: string,
): Promise<string> {
  try {
    // Process the template with all context
    const template = Handlebars.compile(systemPrompt);
    const finalPrompt = template({
      title: scenario.title.toLowerCase(),
      description: scenario.description.toLowerCase(),
      name: persona.name,
      age: persona.age,
      gender: persona.gender.toLowerCase(),
      job: persona.job,
      family_status: persona.family_status.toLowerCase(),
      segment: persona.segment,
      major_issues_in_workplace: persona.major_issues_in_workplace,
      uk_party_affiliation: persona.uk_party_affiliation,
      personality_traits: persona.personality_traits,
      emotional_conditions: persona.emotional_conditions,
      busyness_level: persona.busyness_level,
      workplace: persona.workplace,
    });
    console.log(finalPrompt);
    return finalPrompt;
  } catch (error) {
    console.error("Error in createCompletePrompt:", error);
    return systemPrompt;
  }
}

/**
 * Generates an array of message data to start a conversation.
 *
 * @param systemPrompt - The initial prompt from the system.
 * @param userMessage - The message from the user.
 * @returns An array of message data objects with roles and content.
 */
export function conversationStarter(systemPrompt: string, userMessage: string): MessageToOpenAi[] {
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];
}
