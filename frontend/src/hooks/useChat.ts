import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChatSession, ChatMessage } from "@/types/chat";
import { useDebounce } from "@/hooks/useDebounce";
import { selectedPersonaAtom, scenarioAtom } from "@/store";
import { useAtom } from "jotai";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { createNewChat } from "@/components/screens/InitiateChat/InitiateChat";

export const useChat = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const searchParams = useSearchParams();
  const [isWaitingForInitialResponse, setIsWaitingForInitialResponse] = useState(false);
  const [systemPromptId] = useState<string | null>(null);
  const initializationAttempted = useRef(false);
  const [persona] = useAtom(selectedPersonaAtom);
  const [scenarioInfo] = useAtom(scenarioAtom);

  async function sendUserMessage(conversationId: string, content: string, scenario_id: string) {
    const response = axios.post<ChatMessage>("/api/chat/send-user-message", {
      conversationId,
      content,
      scenario_id,
    });
    return response;
  }
  // TODO: requires more refactoring
  const handleSendMessage = async (message: string, conversationId: string, scenarioId: string) => {
    if (!conversationId || !message.trim() || !scenarioId) {
      console.error("ConversationId or scenarioId is missing or message is empty");
      return;
    }

    setIsLoading(true);
    try {
      const userMessage: ChatMessage = {
        id: uuid(),
        text: message,
        sender: "user",
      };

      setCurrentSession((prev) => ({
        ...prev!,
        messages: [...(prev?.messages || []), userMessage],
      }));
      // NOTE: this is where the message is sent to the LLM and DB
      const response = await sendUserMessage(conversationId, message, scenarioId);
      const botMessage = response.data;
      if (response) {
        setCurrentSession((prev) => ({
          ...prev!,
          messages: [...(prev?.messages || []), botMessage],
        }));
      } else {
        throw new Error("Unexpected response format");
      }

      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      const botErrorMessage: ChatMessage = {
        id: uuid(),
        text: "An error occurred. Please try again.",
        sender: "bot",
      };
      setCurrentSession((prev) => ({
        ...prev!,
        messages: [...(prev?.messages || []), botErrorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const initialize = useCallback(
    async (initialMessage?: string) => {
      if (initializationAttempted.current) return;
      initializationAttempted.current = true;

      setIsWaitingForInitialResponse(true);

      try {
        const firstMessageParam = initialMessage || searchParams.get("firstMessage");
        const initialResponseParam = searchParams.get("initialResponse");
        // const scenarioId = searchParams.get('scenarioId') || scenarioInfo?.id;
        const scenarioId = scenarioInfo?.id;
        // const systemPromptIdParam = searchParams.get("systemPromptId");
        const conversationIdParam = searchParams.get("conversationId");
        if (!scenarioId || !persona) {
          if (!persona) {
            console.error("Persona is missing");
          }
          throw new Error("Missing scenarioId or persona");
        }
        // Handle existing conversation
        if (conversationIdParam) {
          setConversationId(conversationIdParam);
          const initialMessages = [];
          if (firstMessageParam) {
            initialMessages.push({
              id: uuid(),
              text: firstMessageParam,
              sender: "user" as const,
            });
          }
          if (initialResponseParam) {
            initialMessages.push({
              id: uuid(),
              text: initialResponseParam,
              sender: "bot" as const,
            });
          }
          setCurrentSession({
            id: uuid(),
            conversationId: conversationIdParam,
            messages: initialMessages,
          });
          return;
        }
        // Create new conversation if needed
        // TODO: replace with next api call
        if (!conversationId && firstMessageParam) {
          const conversationResponse = await createNewChat({
            userId: uuid(),
            initialMessage: firstMessageParam,
            scenarioId,
            persona,
          });

          // await createConversation(
          //   firstMessageParam,
          //   scenarioId,
          //   persona,
          //   systemPromptIdParam ? Number(systemPromptIdParam) : undefined
          // );
          if (!conversationResponse || !conversationResponse.id) {
            throw new Error("Failed to create conversation");
          }
          setConversationId(conversationResponse.id);
          setCurrentSession({
            id: uuid(),
            conversationId: conversationResponse.id,
            messages: [
              {
                id: uuid(),
                text: firstMessageParam,
                sender: "user",
              },
              {
                id: uuid(),
                text: conversationResponse.aiResponse,
                sender: "bot",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        initializationAttempted.current = false;
      } finally {
        setIsWaitingForInitialResponse(false);
      }
    },
    [searchParams, conversationId, scenarioInfo, persona],
  );

  // Create debounced version of initialize
  const debouncedInitialize = useDebounce(initialize, 300);

  // Wrap initialize in a function that uses the debounced version
  const initializeSession = useCallback(
    (initialMessage?: string) => {
      debouncedInitialize(initialMessage);
    },
    [debouncedInitialize],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      initializationAttempted.current = false;
    };
  }, []);

  return {
    currentSession,
    conversationId,
    isLoading,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    initializeSession,
    isWaitingForInitialResponse,
    systemPromptId,
  };
};
