'use server'
import { OpenAI } from "openai";

export async function getOpenAIClient() {
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    return openaiClient;
  }