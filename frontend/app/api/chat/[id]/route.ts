import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../init";


  


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


// NOTE this get the conversation data from conversation table 
// the combines this with the messages data from the messages table
// the result can be used to populate the chat component
// TODO: move to chat service 
// TODO rename to getConversationDataWithMessages
async function getConversationDataById(id: string) {
    try {
        console.log("GETTING CONVERSATION DATA USING CHAT ID", id);
        const { data: chatData, error: chatDataError } = await supabase.from("conversations").select("conversation_id, scenario_id, user_id, persona_id, system_prompt_id, feedback_prompt_id").eq("id", id).single();
        if (chatDataError) {
            console.error("Error fetching chat data:", chatDataError);
             throw new Error("Error fetching chat data");
        }

        
        // NOTE we get the messages data from the conversation_id field in the conversation table
        const { data: messagesData, error: messagesError } = await supabase.from("messages").select("*").eq("conversation_id", chatData?.conversation_id)
        
        const conversationData: ConversationData = {
            messages: messagesData || [],
            conversationId: chatData?.conversation_id,
            scenarioId: chatData?.scenario_id,
            userId: chatData?.user_id,
            personaId: chatData?.persona_id,
            systemPromptId: chatData?.system_prompt_id,
            feedbackPromptId: chatData?.feedback_prompt_id
        }


        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            return null;
        }

        return conversationData;
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return null;
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    if (!id) {
        console.warn("Invalid ID:", id);
        return NextResponse.json({ error: "Server returned an error" }, { status: 400 });
    }

  const chat = await getConversationDataById(id);
  return NextResponse.json(chat);
}
