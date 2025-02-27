import { NextRequest, NextResponse } from "next/server";
import { initialiseChat } from "@/lib/server/services/chat/createNewChat";
import { z } from "zod";

const initialiseChatRequestSchema = z.object({
    userId: z.string(),
    scenarioId: z.string(),
    persona: z.any(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsedBody = initialiseChatRequestSchema.parse(body);
        const conversationId = await initialiseChat(parsedBody.userId, parsedBody.scenarioId, parsedBody.persona);
        return NextResponse.json({ id: conversationId });
    } catch (error) {
        console.error("Error in initialiseChat:", error);
        return NextResponse.json({ error: "Failed to initialise chat" }, { status: 500 });
    }
}