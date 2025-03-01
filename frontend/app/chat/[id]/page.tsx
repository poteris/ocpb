"use client"
import StartChat from "./StartChat";
import ChatComponent from "./ChatComponent";
// import { Message } from "./ChatComponent";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import Image from "next/image";

export interface Message {
    content: string;
    conversation_id: string;
    created_at: string;
    id: string;
    role: string;
  }
  
  
  export interface ConversationData {
    messages: Message[]
    id: string;
    conversationId: string;
    userId: string;
    scenarioId: string;
    personaId: string;
    systemPromptId: string;
    feedbackPromptId: string;
  }


async function getConversationData(conversationId: string) {
    try {
        const response = await axios.get<ConversationData>(`/api/chat/${conversationId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching conversation data", error);
        throw error; // Re-throw to handle it in the calling function
    }
}

export default function ChatPage() {
    const { id } = useParams();
    const [conversationData, setConversationData] = useState<ConversationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const fetchConversations = async () => {
            if (typeof id === 'string') {
                try {
                    const data = await getConversationData(id);
                    setConversationData(data);
                } catch (error) {
                    console.error("Failed to fetch conversation data", error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.error("Invalid conversation ID");
                setLoading(false);
            }
        };
        fetchConversations();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <Image
                width={200}
                height={200}
                alt="Union Training Bot"
                src="/images/chat-bot.svg"
                className="mb-6 md:mb-8 w-[150px] md:w-[250px]"
                priority
            />
        </div>;
    }

    return (
        <div>
            {conversationData ? (
                <StartChat chatData={conversationData} />
            ) : (
               <ChatComponent conversationData={conversationData}/>
            )}
        </div>
    );
}   



