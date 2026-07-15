'use server'
import OpenAI from "openai";
import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";
import Handlebars from "handlebars";
import { getOpenAIClient } from './services/openai/OpenAIClientFactory';
import { ChatCompletionRequest } from './services/openai/ChatCompletionTypes';
import { getLlmModel } from './llmModel';

export async function getAIResponse(messages: OpenAI.ChatCompletionMessageParam[], headers: Headers = new Headers()): Promise<string | null> {
  const formattedMessages = messages.map((msg) => ({
    role: msg.role as "user" | "system" | "assistant",
    content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
  }));
  const params: ChatCompletionRequest = {
    messages: formattedMessages,
    model: await getLlmModel(),
  };

  const completion = await getOpenAIClient(headers).createChatCompletion(params);
  return completion.choices[0]?.message?.content ?? null;
}

export async function createBasePromptForMessage(
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
    return finalPrompt;
  } catch (error) {
    console.error("Error in createBasePromptForMessage:", error);
    return systemPrompt;
  }
}

