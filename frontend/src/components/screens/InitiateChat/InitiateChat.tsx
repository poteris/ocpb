"use client";

import React, { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatModals } from "../../ChatModals";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAtom } from "jotai";
import { selectedPersonaAtom } from "@/store";
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

const InitiateChatContent: React.FC = () => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigatingToChat, setIsNavigatingToChat] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const [persona] = useAtom(selectedPersonaAtom);
  const scenarioId = searchParams.get("scenarioId");
  const [scenarioInfo, setScenarioInfo] = useState<TrainingScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScenario = async () => {
      try {
        if (!scenarioId || !persona) {
          router.push('/');
          return;
        }

        const scenario = await getScenario(scenarioId);
        setScenarioInfo(scenario);
      } catch (error) {
        console.error('Error loading scenario:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenario();
  }, [persona, router, scenarioId]);

  const startChat = async (message: string) => {
    if (isInitiatingChat || !persona) return;

    try {
      setIsInitiatingChat(true);
      setIsNavigatingToChat(true);

      // create new chat
      const conversationResponse = await createNewChat({
        userId: uuidv4(),
        initialMessage: message,
        scenarioId: scenarioId!,
        persona,
      });

      const chatId = conversationResponse.id;

      if (conversationResponse) {
        const url = `/chat-screen?conversationId=${chatId}`;
        router.push(url);
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
    } else if (inputMessage) {
      startChat(inputMessage.trim());
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
              <div className="flex flex-col sm:flex-row items-center gap-3 p-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="w-full bg-slate-50 text-[14px] p-4 rounded-full border-none shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-0 focus:ring-0 placeholder:text-xs placeholder:px-2"
                  placeholder="Start typing..."
                />

                <Button
                  onClick={() => handleStartChat()}
                  className="w-full sm:w-auto text-base py-2 px-4 rounded-full whitespace-nowrap flex items-center justify-center text-sm"
                  disabled={!inputMessage}>

                  Send
                  <SendHorizontal className="w-4 h-4 mr-2" />
                </Button>
              </div>
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

const InitiateChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-shrink-0">
        <Skeleton className="h-12 md:h-16 w-full" />
      </div>

      <main className="flex-grow w-full px-4 flex flex-col md:container md:mx-auto md:px-6 lg:px-8 md:max-w-screen-xl">
        <div className="w-full flex-grow flex flex-col justify-between py-4 md:py-8 md:max-w-3xl md:mx-auto">
          <div>
            <Skeleton className="h-8 md:h-10 w-32 md:w-40 mb-6 md:mb-8" />
            <div className="flex flex-col items-center mb-8 md:mb-12">
              <Skeleton className="w-[150px] h-[150px] md:w-64 md:h-64 mb-6 md:mb-8 rounded-full" />
              <Skeleton className="h-8 md:h-10 w-full md:w-3/4 mb-4 md:mb-6" />
              <Skeleton className="h-5 md:h-6 w-full mb-2" />
              <Skeleton className="h-5 md:h-6 w-5/6 mb-6 md:mb-8" />
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 mb-8 md:mb-12">
              {[1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="h-12 md:h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <Skeleton className="h-10 md:h-12 w-full rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

export const InitiateChat: React.FC = () => {
  return (
    <Suspense fallback={<InitiateChatSkeleton />}>
      <InitiateChatContent />
    </Suspense>
  );
};
