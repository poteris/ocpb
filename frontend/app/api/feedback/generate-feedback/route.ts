import { NextRequest, NextResponse } from "next/server";
import { feedbackDataSchema } from "@/types/feedback";
import { generateFeedbackUsingLLM } from "@/lib/server/services/feedback/feedbackCompletion";
import { supabaseService as supabase } from "../../service-init";
import { createClient } from "@/utils/supabase/server";

async function getExistingFeedback(conversationId: string) {
  const { data, error } = await supabase
    .from("feedback")
    .select("score, summary, strengths, areas_for_improvement")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (error) {
    console.error("Error reading existing feedback:", error);
    return null;
  }

  if (!data) return null;

  const parsed = feedbackDataSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Stored feedback failed validation, regenerating:", parsed.error);
    return null;
  }

  return parsed.data;
}

async function getScenarioId(conversationId: string) {
  // Read via the anon cookie client, not the service-role client: the
  // labour_party tenant deliberately keeps service_role minimal and only anon
  // is granted SELECT on conversations (see 20250403072533_labour_party_schema).
  const anon = await createClient();
  const { data, error } = await anon
    .from("conversations")
    .select("scenario_id")
    .eq("conversation_id", conversationId)
    .single();

  if (error) {
    console.error("Error reading scenario_id for conversation:", error);
    return undefined;
  }

  return data?.scenario_id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const existingFeedback = await getExistingFeedback(body.conversationId);
    if (existingFeedback) {
      const scenarioId = await getScenarioId(body.conversationId);
      return NextResponse.json({ ...existingFeedback, scenario_id: scenarioId }, { status: 200 });
    }

    const feedback = await generateFeedbackUsingLLM(body.conversationId);

    const parsedFeedback = feedbackDataSchema.parse(feedback);

    // Save feedback to database so the leaderboard can rank best scores
    const { error } = await supabase
      .from("feedback")
      .upsert({
        conversation_id: body.conversationId,
        score: parsedFeedback.score,
        summary: parsedFeedback.summary,
        strengths: parsedFeedback.strengths,
        areas_for_improvement: parsedFeedback.areas_for_improvement,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'conversation_id'
      });

    if (error) {
      console.error("Error saving feedback:", error);
      // Still return the feedback even if saving fails
    }

    const scenarioId = await getScenarioId(body.conversationId);

    return NextResponse.json({ ...parsedFeedback, scenario_id: scenarioId }, { status: 200 });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
