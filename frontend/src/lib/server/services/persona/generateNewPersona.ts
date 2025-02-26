'use server'
import OpenAI from "openai";
import { genericNewPersonaPrompt } from "@/utils/genericNewPersonaPrompt";
import { v4 as uuidv4 } from "uuid";
import { tools as openAifunctions } from "@/utils/openaiTools";
import { openaiClient } from "../../../../../app/api/init";



export const generateNewPersona = async () => {
  const messages: OpenAI.ChatCompletionMessageParam[] = [{ role: "user", content: genericNewPersonaPrompt }];
  const llm = process.env.LLM_MODEL ?? "gpt-4o";
  const completion = await openaiClient.chat.completions.create({
    model: llm,
    messages: messages,
    tools: openAifunctions,
    store: true,
    tool_choice: { type: "function", function: { name: "generate_persona" } },
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "generate_persona") {
    throw new Error("Function call missing or incorrect.");
  }

  const generatedPersona = JSON.parse(toolCall.function.arguments);
  generatedPersona.id = uuidv4();

  return generatedPersona;
};
