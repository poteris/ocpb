import OpenAI from "openai";
import { getFeedbackPrompt } from "./feedbackPrompt";
import { openaiClient } from "@/lib/init";
import {tools} from "@/utils/openaiTools";


export async function generateFeedbackUsingLLM(conversationId: string) {
  const feedbackPrompt = await getFeedbackPrompt(conversationId);
  const messages: OpenAI.ChatCompletionMessageParam[] = [{ role: "user", content: feedbackPrompt }];
  const llm = process.env.LLM_MODEL || "gpt-4o";
  const completion = await openaiClient.chat.completions.create({
    model: llm,
    messages: messages,
    tools: tools,
    store: true,
    tool_choice: { "type": "function", "function": { "name": "generate_feedback" } },

  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
  // 
  if (!toolCall || toolCall.function.name !== "generate_feedback") {
    throw new Error("Function call missing or incorrect.");
  }

  const feedbackData = JSON.parse(toolCall.function.arguments);
  return feedbackData;
}
