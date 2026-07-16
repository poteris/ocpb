'use server'
import { genericNewPersonaPrompt } from "@/utils/genericNewPersonaPrompt";
import { v4 as uuidv4 } from "uuid";
import { tools as openAifunctions } from "@/utils/openaiTools";
import { getOpenAIClient } from "../openai/OpenAIClientFactory";
import { getLlmModel } from "../../llmModel";

export const generateNewPersona = async (headers: Headers = new Headers()) => {

  let toolCall = await generatePersona(headers);
  
  if (!toolCall || toolCall.function.name !== "generate_persona") {
    throw new Error("Function call missing or incorrect.");
  }

  // Check for template variables in the raw arguments before parsing
  if (toolCall.function.arguments.includes('{{')) {
    toolCall = await retryPersonaGeneration(headers);
    if (!toolCall || toolCall.function.name !== "generate_persona") {
      throw new Error("Function call missing or incorrect.");
    }
  } 

  const generatedPersona = JSON.parse(toolCall.function.arguments);
  generatedPersona.id = uuidv4();
  return generatedPersona;
};

const retryPersonaGeneration = async (headers: Headers) => {
  // If template variables found, retry generation
  console.log("Template variables found, retrying persona generation");

  const retryToolCall = await generatePersona(headers);

  if (!retryToolCall || retryToolCall.function.name !== "generate_persona") {
    throw new Error("Function call missing or incorrect in retry attempt.");
  }

  if (retryToolCall.function.arguments.includes('{{')) {
    throw new Error("Template variables still present in the retry response.");
  } 
  return retryToolCall;
}

const generatePersona = async (headers: Headers) => {
  const messages = [{ role: "user", content: genericNewPersonaPrompt }];
  const llm = await getLlmModel();
  const openaiClient = getOpenAIClient(headers);
  const completion = await openaiClient.createChatCompletion({
    model: llm,
    messages: messages,
    tools: openAifunctions,
    store: true,
    tool_choice: { type: "function", function: { name: "generate_persona" } },
    temperature: 0.9,
  });
  return completion.choices[0]?.message?.tool_calls?.[0];
}
