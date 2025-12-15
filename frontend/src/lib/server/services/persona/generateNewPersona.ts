'use server'
import { genericNewPersonaPrompt } from "@/utils/genericNewPersonaPrompt";
import { v4 as uuidv4 } from "uuid";
import { tools as openAifunctions } from "@/utils/openaiTools";
import { getOpenAIClient } from "../openai/OpenAIClientFactory";

function generateRandomPersonaProperties() {
  // Randomly select a segment
  const segments = ['Young Worker', 'Former Member', 'Reluctant Worker', 'Non-member'];
  const segment = segments[Math.floor(Math.random() * segments.length)];
  
  // Generate age based on segment
  let age;
  if (segment === 'Young Worker') {
    // Young workers are between 18-28
    age = Math.floor(Math.random() * (28 - 18 + 1)) + 18;
  } else if (segment === 'Former Member') {
    // Former members are between 45-75
    age = Math.floor(Math.random() * (75 - 45 + 1)) + 45;
  } else {
    // Reluctant Worker and Non-member are between 25-75
    age = Math.floor(Math.random() * (75 - 25 + 1)) + 25;
  }
  
  // Randomly select gender
  const genders = ['male', 'female'];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  console.log("Generating persona with Gender: ", gender, " Age: ", age, " Segment: ", segment);
  return {
    age,
    segment,
    gender
  };
}

export const generateNewPersona = async (headers: Headers = new Headers()) => {
  let toolCall = await generatePersona(headers);

  if (!toolCall || toolCall.function.name !== "generate_persona") {
    throw new Error("Function call missing or incorrect.");
  }

  // Check for template variables in the raw arguments before parsing
  if (toolCall.function.arguments.includes('{{')) {
    console.log("Template variables found, retrying persona generation");
    toolCall = await retryPersonaGeneration();
    if (!toolCall || toolCall.function.name !== "generate_persona") {
      throw new Error("Function call missing or incorrect.");
    }
  } 

  const generatedPersona = JSON.parse(toolCall.function.arguments);
  generatedPersona.id = uuidv4();
  return generatedPersona;
}
  
const retryPersonaGeneration = async () => {
  // If template variables found, retry generation
  console.log("Template variables found, retrying persona generation");

  const retryToolCall = await generatePersona();

  if (!retryToolCall || retryToolCall.function.name !== "generate_persona") {
    throw new Error("Function call missing or incorrect in retry attempt.");
  }

  if (retryToolCall.function.arguments.includes('{{')) {
    throw new Error("Template variables still present in the retry response.");
  } 
  return retryToolCall;
}

const generatePersona = async (headers: Headers = new Headers()) => {
    // Generate random properties
    const randomProperties = generateRandomPersonaProperties();
      
    // Replace the placeholders in the prompt
    let prompt = genericNewPersonaPrompt;
    prompt = prompt.replace('{{age}}', randomProperties.age.toString());
    prompt = prompt.replace('{{segment}}', randomProperties.segment);
    prompt = prompt.replace('{{gender}}', randomProperties.gender);
      
    const messages = [{ role: "user" as const, content: prompt }];
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
    return completion.choices[0]?.message?.tool_calls?.[0];
}
