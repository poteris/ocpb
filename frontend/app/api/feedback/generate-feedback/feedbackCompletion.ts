import OpenAI from "openai";
import { getFeedbackPrompt } from "./feedbackPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFeedbackUsingLLM(conversationId: string) {
    console.log('Generating feedback for conversation:', conversationId);   
  const feedbackPrompt = await getFeedbackPrompt(conversationId);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: feedbackPrompt }],
    functions: [
      {
        name: "generate_feedback",
        description: "Generate feedback for the conversation",
        parameters: {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: "Score between 1 and 5",
            },
            summary: {
              type: "string",
              description: "Brief summary of overall performance",
            },
            strengths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
              description: "List of strengths identified in the conversation",
            },
            areas_for_improvement: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
              description:
                "List of areas for improvement identified in the conversation",
            },
          },
          required: ["score", "summary", "strengths", "areas_for_improvement"],
        },
      },
    ],
    function_call: { name: "generate_feedback" },
  });

  const functionCall = completion.choices[0].message.function_call;
  if (!functionCall || !functionCall.arguments) {
    throw new Error("No function call or arguments received from OpenAI");
  }

  const feedbackData = JSON.parse(functionCall.arguments);

  return feedbackData;
}
