import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/init";
interface Message {
    content: string;
    conversation_id: string;
    created_at: string;
    id: string;
    role: string;
  }
  

 interface ConversationData {
    messages: Message[];
    conversationId: string;
    scenarioId: string;
    userId: string;
    personaId: string;
    systemPromptId: string;
    feedbackPromptId: string
}

async function getConversationDataByConversationId(id: string) {
    try {
        const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", id)
        const { data: chatData, error: chatDataError } = await supabase.from("conversations").select("conversation_id, scenario_id, user_id, persona_id, system_prompt_id, feedback_prompt_id").eq("conversation_id", id).single();
        
        const conversationData: ConversationData = {
            messages: data || [],
            conversationId: chatData?.conversation_id,
            scenarioId: chatData?.scenario_id,
            userId: chatData?.user_id,
            personaId: chatData?.persona_id,
            systemPromptId: chatData?.system_prompt_id,
            feedbackPromptId: chatData?.feedback_prompt_id
        }

        if (error) {
            console.error("Error fetching conversation:", error);
            return null;
        }
        if (chatDataError) {
            console.error("Error fetching chat data:", chatDataError);
            return null;
        }
        console.log(conversationData);
        return conversationData;
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return null;
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    console.log("Fetching chat:", id);
    if (!id) {
        console.warn("Invalid ID:", id);
        return NextResponse.json({ error: "Server returned an error" }, { status: 400 });
    }

    console.log("Fetching chat:", id);
  const chat = await getConversationDataByConversationId(id);
  return NextResponse.json(chat);
}
