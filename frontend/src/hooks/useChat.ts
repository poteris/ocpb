import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatSession, Message } from '@/types/chat';
import { createConversation, sendMessage } from '@/utils/api';
import { useScenario } from '@/context/ScenarioContext';
import { useDebounce } from '@/hooks/useDebounce';

export const useChat = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const searchParams = useSearchParams();
  const [isWaitingForInitialResponse, setIsWaitingForInitialResponse] = useState(false);
  const { scenarioInfo, persona } = useScenario();
  const [systemPromptId] = useState<string | null>(null);
  const initializationAttempted = useRef(false);

  const handleSendMessage = async (message: string, conversationId: string, scenarioId: string) => {
    if (!conversationId || !message.trim() || !scenarioId) {
      console.error('ConversationId or scenarioId is missing or message is empty');
      return;
    }

    setIsLoading(true);
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
      };
      setCurrentSession(prev => ({
        ...prev!,
        messages: [...(prev?.messages || []), userMessage]
      }));

      const response = await sendMessage(conversationId, message, scenarioId);
      
      if (response && response.content) {
        setCurrentSession(prev => ({
          ...prev!,
          messages: [
            ...(prev?.messages || []),
            {
              id: Date.now().toString(),
              text: response.content,
              sender: 'bot'
            }
          ]
        }));
      } else {
        throw new Error('Unexpected response format');
      }

      setInputMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      setCurrentSession(prev => ({
        ...prev!,
        messages: [...(prev?.messages || []), {
          id: Date.now().toString(),
          text: "An error occurred. Please try again.",
          sender: 'bot'
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const initialize = useCallback(async (initialMessage?: string) => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;
    
    setIsWaitingForInitialResponse(true);

    try {
      const firstMessageParam = initialMessage || searchParams.get('firstMessage');
      const initialResponseParam = searchParams.get('initialResponse');
      const scenarioId = searchParams.get('scenarioId') || scenarioInfo?.id;
      const systemPromptIdParam = searchParams.get('systemPromptId');
      const conversationIdParam = searchParams.get('conversationId');

      if (!scenarioId || !persona) {
        throw new Error('Missing scenarioId or persona');
      }

      // Handle existing conversation
      if (conversationIdParam) {
        setConversationId(conversationIdParam);
        const initialMessages = [];
        
        if (firstMessageParam) {
          initialMessages.push({ 
            id: `first-${Date.now()}`, 
            text: firstMessageParam, 
            sender: 'user' as const 
          });
        }
        
        if (initialResponseParam) {
          initialMessages.push({
            id: `response-${Date.now()}`,
            text: initialResponseParam,
            sender: 'bot' as const
          });
        }
        
        setCurrentSession({
          id: Date.now().toString(),
          conversationId: conversationIdParam,
          messages: initialMessages
        });
        return;
      }

      // Create new conversation if needed
      if (!conversationId && firstMessageParam) {
        const conversationResponse = await createConversation(
          firstMessageParam, 
          scenarioId, 
          persona,
          systemPromptIdParam ? Number(systemPromptIdParam) : undefined
        );

        if (!conversationResponse || !conversationResponse.id) {
          throw new Error('Failed to create conversation');
        }

        setConversationId(conversationResponse.id);
        setCurrentSession({
          id: Date.now().toString(),
          conversationId: conversationResponse.id,
          messages: [
            {
              id: `first-${Date.now()}`,
              text: firstMessageParam,
              sender: 'user' as const
            },
            {
              id: `response-${Date.now()}`,
              text: conversationResponse.aiResponse,
              sender: 'bot' as const
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      initializationAttempted.current = false;
    } finally {
      setIsWaitingForInitialResponse(false);
    }
  }, [searchParams, conversationId, scenarioInfo, persona]);

  // Create debounced version of initialize
  const debouncedInitialize = useDebounce(initialize, 300);

  // Wrap initialize in a function that uses the debounced version
  const initializeSession = useCallback((initialMessage?: string) => {
    debouncedInitialize(initialMessage);
  }, [debouncedInitialize]);

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
