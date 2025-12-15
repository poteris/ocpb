import { NextRequest, NextResponse } from "next/server";
import { feedbackDataSchema } from "@/types/feedback";
import { generateFeedbackUsingLLM } from "@/lib/server/services/feedback/feedbackCompletion";
import { supabaseService as supabase } from "../../service-init";
import { runAllAssertions } from "@/lib/server/services/assertions/conversationAssertions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const feedback = await generateFeedbackUsingLLM(body.conversationId);

    const parsedFeedback = feedbackDataSchema.parse(feedback);

    // Save feedback to database
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

    // Run assertions after feedback is generated and saved
    try {
      // Get conversation messages for assertions
      const { data: messages } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', body.conversationId)
        .order('created_at', { ascending: true });

      if (messages && messages.length > 0) {
        // Run assertions with feedback data
        const assertionResults = runAllAssertions(messages, parsedFeedback);

        // Save assertion results
        await supabase
          .from('conversation_assertions')
          .delete()
          .eq('conversation_id', body.conversationId);

        const assertionsToInsert = assertionResults.map(result => ({
          conversation_id: body.conversationId,
          assertion_name: result.assertion_name,
          passed: result.passed,
          details: result.details
        }));

        await supabase
          .from('conversation_assertions')
          .insert(assertionsToInsert);

        console.log(`Ran ${assertionResults.length} assertions for conversation ${body.conversationId}`);
      }
    } catch (assertionError) {
      console.error("Error running assertions:", assertionError);
      // Don't fail the request if assertions fail
    }

    return NextResponse.json(parsedFeedback, { status: 200 });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
