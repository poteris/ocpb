"use client"
import StartChat from "./StartChat";
import ChatComponent from "./ChatComponent";
// import { Message } from "./ChatComponent";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import Image from "next/image";

interface Message {
    text: string;
    sender: string;
    timestamp: Date;
}

export interface ConversationData {
    messages: Message[];
    conversationId: string;
    scenarioId: string;
    userId: string;
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
    
    const [conversations, setConversations] = useState<ConversationData[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Add a loading state

    useEffect(() => {
        const fetchConversations = async () => {
            if (typeof id === 'string') {
                try {
                    const conversationData = await getConversationData(id);
                    setConversations([conversationData]);
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
            {conversations.length > 0 ? <StartChat conversationId={id as string} /> : <ChatComponent/>}  
        </div>
    );
}   



