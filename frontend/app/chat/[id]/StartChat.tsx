"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";
import ChatComponent from "./ChatComponent";
import InitChat from "./InitChat";
import { Message, ConversationData } from "./page";
const PROMPTS = [
  "Hi, can I interrupt you for a sec?",
  "Hey, how are you doing?",
  "Hey mate, sorry to bother you - how's it going?",
  "What are you up to?",
];

interface CreateNewChatRequest {
  userId: string;
  initialMessage: string;
  scenarioId: string;
  persona: Persona;
  systemPromptId?: number;
}
interface ConversationResponse {
  id: string;
  aiResponse: string;
}


export async function createNewChat({ initialMessage, scenarioId, persona }: CreateNewChatRequest) {
  try {
    const response = await axios.post<ConversationResponse>("/api/chat/create-new-chat", {
      userId: uuidv4(), // NOTE: this should be set by db, currently we don't have a user based system
      initialMessage,
      scenarioId,
      persona,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw error;
  }
}

async function getScenario(scenarioId: string) {
  try {
    const response = await axios.get<TrainingScenario>(`/api/scenarios/${scenarioId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching scenario:", error);
    throw error;
  }
}

async function getPersona(personaId: string) {
  try {
    const response = await axios.get<Persona>(`/api/persona/${personaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching persona:", error);
    throw error;
  }
}

async function getConversation(conversationId: string) {
  try {
    const response = await axios.get<ConversationData>(`/api/chat/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
}


async function sendUserMessage(conversationId: string, content: string, scenarioId: string) {
  try {
    const response = await axios.post<Message>('/api/chat/send-user-message', {
      conversationId,
      content,
      scenario_id: scenarioId
    });
    console.log("SEND USER MESSAGE RESPONSE", response);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

interface StartChatProps {
  chatData: ConversationData;
}


const StartChat: React.FC<StartChatProps> = ({ chatData }) => {
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [conversationData, setConversationData] = useState<ConversationData | null>(chatData);
  const [scenarioInfo, setScenarioInfo] = useState<TrainingScenario | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(chatData?.messages || null);

  useEffect(() => {
    if (!chatData) {
      router.push('/');
    }
  }, [chatData, router]);

  useEffect(() => {
    const loadScenarioAndPersona = async () => {
      if (conversationData) {
        const scenarioId = conversationData.scenarioId;
        const personaId = conversationData.personaId;
        const scenario = await getScenario(scenarioId);
        const persona = await getPersona(personaId);
        setScenarioInfo(scenario);
      }
    };

    loadScenarioAndPersona();
  }, [conversationData]);

  const startChat = async (message?: string) => {
   
    if (!conversationData) return;

    try {
      setLoading(true);
      console.log("START CHAT", message);

      if (!message?.trim()) {
        console.error("Message is missing.");
        return;
      }

      const response = await sendUserMessage(
        conversationData.conversationId,
        message.trim(),
        conversationData.scenarioId
      );
      console.log("RESPONSE", response);
      
      if (response) {
        const updatedConversation = await getConversation(conversationData.id);
        setConversationData(updatedConversation);
        setMessages(updatedConversation?.messages);
      }

    } catch (error: unknown) {
      console.error("Error starting conversation:", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (prompt?: string) => {
    console.log("handleStartChat", prompt, inputMessage);
    if (prompt) {
      startChat(prompt);
    } else {
      startChat(inputMessage.trim() || undefined);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <>
      {messages && messages.length > 0 ? (
        <ChatComponent conversationData={conversationData} />
      ) : (
        <InitChat handleStartChat={handleStartChat} starterPrompts={PROMPTS} handleInputChange={handleInputChange} inputMessage={inputMessage} />
      )}
    </>
  )
}

export default StartChat;