import { NextRequest, NextResponse } from "next/server";
import { getConversationTranscript } from "@/lib/server/services/elevenlabs/agentService";
import { syncTranscriptToDatabase } from "@/lib/server/services/elevenlabs/transcriptService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, elevenLabsConversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      );
    }

    // If elevenLabsConversationId provided, fetch and sync transcript
    if (elevenLabsConversationId) {
      try {
        const transcriptData = await getConversationTranscript(elevenLabsConversationId);
        
        // Sync transcript to our database
        await syncTranscriptToDatabase(conversationId, transcriptData);

        return NextResponse.json({
          success: true,
          messageCount: transcriptData.transcript?.length || 0,
          duration: transcriptData.call_duration_secs || 0
        }, { status: 200 });
      } catch (transcriptError) {
        console.error('Error fetching/syncing transcript:', transcriptError);
        // Don't fail the whole request - transcript might be available later
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch transcript',
          details: transcriptError instanceof Error ? transcriptError.message : 'Unknown error'
        }, { status: 200 }); // Still return 200 so UI can proceed
      }
    }

    // If no elevenLabsConversationId, just acknowledge
    return NextResponse.json({
      success: true,
      message: 'Session ended (no transcript to sync)'
    }, { status: 200 });

  } catch (error) {
    console.error('Error ending voice session:', error);
    return NextResponse.json(
      { error: 'Failed to end voice session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}




