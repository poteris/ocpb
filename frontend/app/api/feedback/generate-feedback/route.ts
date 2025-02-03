import { NextRequest, NextResponse } from "next/server";
import { feedbackDataSchema } from "@/types/feedback";
import { generateFeedbackUsingLLM } from "./feedbackCompletion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Generating feedback for conversation:", body.conversationId);
    const feedback = await generateFeedbackUsingLLM(body.conversationId);
    console.log("Generated feedback:", feedback);

    const parsedFeedback = feedbackDataSchema.parse(feedback);

    return NextResponse.json(parsedFeedback, { status: 200 });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
