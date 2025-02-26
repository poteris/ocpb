"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChatModals } from "@/components/ChatModals";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/LoadingScreen";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";
import { Badge } from "@/components/ui/badge";
import { SendHorizontal } from "lucide-react";

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


interface ConversationData {
  id: string;
  conversationId: string;
  userId: string;
  scenarioId: string;
  personaId: string;
  systemPromptId: string;
  feedbackPromptId: string;
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

interface StartChatProps {
  conversationId: string;
}

const StartChat: React.FC<StartChatProps> = ({ conversationId }) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();
  const [isNavigatingToChat, setIsNavigatingToChat] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

  const [scenarioInfo, setScenarioInfo] = useState<TrainingScenario | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
 



  useEffect(() => {
    const loadConversation = async () => {
      try {
        if (!conversationId) {
          router.push('/');
          return;
        }

        const conversation = await getConversation(conversationId);
        setConversationData(conversation);
      } catch (error) {
        console.error('Error loading scenario:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, router]);



useEffect(() => {
  const loadScenarioAndPersona = async () => {
    if (conversationData) {
      const scenarioId = conversationData.scenarioId;
      const personaId = conversationData.personaId;
      const scenario = await getScenario(scenarioId);
      const persona = await getPersona(personaId);
      setScenarioInfo(scenario);
      setPersona(persona);
    }
  };

  loadScenarioAndPersona();
}, [conversationData]);

  const startChat = async (message?: string) => {
    if (isInitiatingChat || !conversationData) return;

    try {
      setIsInitiatingChat(true);
      setIsNavigatingToChat(true);

      if (!scenarioInfo) {
        console.error("Scenario ID is missing.");
        setIsNavigatingToChat(false);
        return;
      }


    } catch (error: unknown) {
      console.error("Error starting conversation:", error instanceof Error ? error.message : "Unknown error");
      setIsNavigatingToChat(false);
    } finally {
      setIsInitiatingChat(false);
    }
  };

  const handleStartChat = async (prompt?: string) => {
    if (prompt) {
      startChat(prompt);
    } else {
      startChat(inputMessage.trim() || undefined);
    }
  };

  if (isNavigatingToChat) {
    return <LoadingScreen title="Starting Conversation" message="Preparing your training session..." />;
  }

  if (isLoading) {
    return <LoadingScreen title="Loading Scenario" message="Please wait..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-shrink-0 w-full" />
      <h3 className="text-center font-light text-sm mt-12">
        Choose a prompt below or start with your own message
      </h3>
      <main className="flex-grow w-full px-4 flex flex-col md:container md:mx-auto md:px-6 lg:px-8 md:max-w-screen-xl">
        <div className="w-full flex-grow flex flex-col justify-between py-4 md:py-8 md:max-w-3xl md:mx-auto">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center mb-8 md:mb-12">
              <Image
                width={200}
                height={200}
                alt="Union Training Bot"
                src="/images/chat-bot.svg"
                className="mb-6 md:mb-8 w-[150px] md:w-[250px]"
                priority
              />
            </div>
          </div>

          <div className="mt-auto">
            <div className="relative">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputMessage.trim()) {
                    handleStartChat();
                  }
                }}
                className="flex flex-col sm:flex-row items-center gap-3 p-2"
              >
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="w-full bg-slate-50 text-[14px] p-4 rounded-full border-none shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-0 focus:ring-0 placeholder:text-xs placeholder:px-2"
                  placeholder="Start typing..."
                />

                <Button
                  type="submit"
                  className="w-full sm:w-auto text-base py-2 px-4 rounded-full whitespace-nowrap flex items-center justify-center text-sm"
                  disabled={!inputMessage}
                >
                  Send
                  <SendHorizontal className="w-4 h-4 mr-2" />
                </Button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-left font-regular text-xs ml-2">
              Struggling to start?
            </p>

            <div className="flex flex-wrap gap-2">
              {PROMPTS.map((prompt) => (
                <Badge
                  key={uuidv4()}
                  onClick={() => handleStartChat(prompt)}
                  className="text-xs font-light rounded-full whitespace-nowrap bg-primary-light text-primary w-fit p-2 hover:bg-primary-light/80 hover:shadow-lg cursor-pointer transition-colors"
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ChatModals
        showInfoPopover={showInfoPopover}
        setShowInfoPopover={setShowInfoPopover}
        scenarioInfo={scenarioInfo}
        persona={persona}
        showEndChatModal={false}
        setShowEndChatModal={() => { }}
        conversationId={""}
      />
    </div>
  );
};

export default StartChat;