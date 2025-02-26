import { NextRequest, NextResponse } from "next/server";
import { feedbackDataSchema } from "@/types/feedback";
import { generateFeedbackUsingLLM } from "@/lib/server/services/feedback/feedbackCompletion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const feedback = await generateFeedbackUsingLLM(body.conversationId);

    const parsedFeedback = feedbackDataSchema.parse(feedback);

    return NextResponse.json(parsedFeedback, { status: 200 });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
