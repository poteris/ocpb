import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService as supabase } from "../../service-init";
import { runAllAssertions } from "@/lib/server/services/assertions/conversationAssertions";

const runAssertionsRequestSchema = z.object({
  conversationId: z.string(),
  feedback: z.object({
    summary: z.string(),
    strengths: z.array(z.object({
      title: z.string(),
      description: z.string()
    })),
    areas_for_improvement: z.array(z.object({
      title: z.string(),
      description: z.string()
    })),
    score: z.number()
  }).optional()
});

async function saveAssertionResults(conversationId: string, results: Array<{assertion_name: string, passed: boolean, details: string}>) {
  // Delete existing assertions for this conversation
  await supabase
    .from('conversation_assertions')
    .delete()
    .eq('conversation_id', conversationId);

  // Insert new assertion results
  const assertionsToInsert = results.map(result => ({
    conversation_id: conversationId,
    assertion_name: result.assertion_name,
    passed: result.passed,
    details: result.details
  }));

  const { error } = await supabase
    .from('conversation_assertions')
    .insert(assertionsToInsert);

  if (error) {
    console.error("Error saving assertion results:", error);
    throw new Error("Failed to save assertion results");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, feedback } = runAssertionsRequestSchema.parse(body);

    // Get conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return NextResponse.json({ error: "Failed to fetch conversation messages" }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages found for conversation" }, { status: 404 });
    }

    // Run assertions
    const assertionResults = runAllAssertions(messages, feedback);

    // Save results to database
    await saveAssertionResults(conversationId, assertionResults);

    return NextResponse.json({
      conversationId,
      assertions: assertionResults,
      totalAssertions: assertionResults.length,
      passedAssertions: assertionResults.filter(r => r.passed).length,
      failedAssertions: assertionResults.filter(r => !r.passed).length
    }, { status: 200 });

  } catch (error) {
    console.error("Error running assertions:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Failed to run assertions" 
    }, { status: 500 });
  }
}
