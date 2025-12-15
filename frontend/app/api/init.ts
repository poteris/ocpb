import { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});