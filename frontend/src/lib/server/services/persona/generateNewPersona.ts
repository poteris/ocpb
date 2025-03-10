'use server'
import OpenAI from "openai";
import { genericNewPersonaPrompt } from "@/utils/genericNewPersonaPrompt";
import { v4 as uuidv4 } from "uuid";
import { tools as openAifunctions } from "@/utils/openaiTools";
import { getOpenAIClient } from "../openai/OpenAIClientFactory";

export const generateNewPersona = async (headers: Headers) => {
  const messages: OpenAI.ChatCompletionMessageParam[] = [{ role: "user", content: genericNewPersonaPrompt }];
  const llm = process.env.LLM_MODEL ?? "gpt-4o";
  const openaiClient = getOpenAIClient(headers);
  const completion = await openaiClient.createChatCompletion({
    model: llm,
    messages: messages,
    tools: openAifunctions,
    store: true,
    tool_choice: { type: "function", function: { name: "generate_persona" } },
    temperature: 0.9,
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "generate_persona") {
    throw new Error("Function call missing or incorrect.");
  }

  const generatedPersona = JSON.parse(toolCall.function.arguments);
  generatedPersona.id = uuidv4();

  return generatedPersona;
};
