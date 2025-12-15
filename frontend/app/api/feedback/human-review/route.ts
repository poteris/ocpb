import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService as supabase } from "../../service-init";

const humanReviewSchema = z.object({
  conversationId: z.string(),
  humanRating: z.enum(['good', 'bad', 'excellent']),
  humanNotes: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, humanRating, humanNotes } = humanReviewSchema.parse(body);

    // Update the feedback record with human review
    const { data, error } = await supabase
      .from("feedback")
      .update({
        human_rating: humanRating,
        human_notes: humanNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .select();

    if (error) {
      console.error("Error updating human review:", error);
      return NextResponse.json({ error: "Failed to update human review" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Feedback record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Human review updated successfully",
      feedback: data[0]
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing human review:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid request data", 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Failed to process human review" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("feedback")
      .select("human_rating, human_notes, updated_at")
      .eq('conversation_id', conversationId)
      .single();

    if (error) {
      console.error("Error fetching human review:", error);
      return NextResponse.json({ error: "Failed to fetch human review" }, { status: 500 });
    }

    return NextResponse.json({
      humanRating: data.human_rating,
      humanNotes: data.human_notes,
      updatedAt: data.updated_at
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching human review:", error);
    return NextResponse.json({ 
      error: "Failed to fetch human review" 
    }, { status: 500 });
  }
}
