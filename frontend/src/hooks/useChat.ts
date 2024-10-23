import { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatSession, Message } from '@/types/chat';
import { createConversation, sendMessage } from '@/utils/api';
import { promptMap } from '@/utils/promptMap';
import { debounce } from 'lodash';
import { useScenario } from '@/context/ScenarioContext';

const STORAGE_KEY = 'chatSessions';

export const useChat = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const sessionInitialized = useRef(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [isWaitingForInitialResponse, setIsWaitingForInitialResponse] = useState(false);
  const { scenarioInfo } = useScenario();
  const [systemPromptId, setSystemPromptId] = useState<string | null>(null);

  const saveSessionToStorage = useCallback((session: ChatSession) => {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedSessions = sessions.map((s: ChatSession) => 
      s.id === session.id ? session : s
    );
    if (!sessions.find((s: ChatSession) => s.id === session.id)) {
      updatedSessions.push(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  }, []);

  const handleSendMessage = async (message: string, conversationId: string) => {
    if (!conversationId || !message.trim()) {
      console.error('ConversationId is missing or message is empty');
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

      const response = await sendMessage(conversationId, message);
      
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

  const initializeSession = useCallback((initialMessage?: string) => {
    const debouncedInitialize = debounce(async () => {
      if (sessionInitialized.current) return;
      sessionInitialized.current = true;
      setIsWaitingForInitialResponse(true);

      try {
        const shortPrompt = searchParams.get('shortPrompt');
        const firstMessageParam = initialMessage || searchParams.get('firstMessage');
        const messageToUse = shortPrompt ? promptMap[shortPrompt] : firstMessageParam;
        const scenarioId = searchParams.get('scenarioId') || scenarioInfo?.id;
        const personaId = searchParams.get('personaId');
        const systemPromptIdParam = searchParams.get('systemPromptId');

        if (!scenarioId || !personaId) {
          throw new Error('Missing scenarioId or personaId');
        }

        if (systemPromptIdParam) {
          setSystemPromptId(systemPromptIdParam);
        }

        if (sessionId) {
          const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const session = sessions.find((s: ChatSession) => s.id === sessionId);
          if (session) {
            setCurrentSession(session);
            setConversationId(session.conversationId);
          } else {
            throw new Error('Session not found');
          }
        } else {
          const newSession: ChatSession = {
            id: Date.now().toString(),
            conversationId: '',
            messages: messageToUse ? [{ id: `first-${Date.now()}`, text: messageToUse, sender: 'user' }] : []
          };
          setCurrentSession(newSession);

          if (!newSession.conversationId) {
            const conversationResponse = await createConversation(messageToUse || '', scenarioId, personaId, systemPromptIdParam || '1');
            if (!conversationResponse || !conversationResponse.id) {
              throw new Error('Failed to create conversation');
            }
            const conversationId = conversationResponse.id;

            setConversationId(conversationId);
            newSession.conversationId = conversationId;
            saveSessionToStorage(newSession);

            if (messageToUse && conversationResponse.aiResponse) {
              setCurrentSession(prevSession => ({
                ...prevSession!,
                messages: [
                  ...prevSession!.messages,
                  { id: Date.now().toString(), text: conversationResponse.aiResponse, sender: 'bot' }
                ]
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        sessionInitialized.current = false;
        setIsWaitingForInitialResponse(false);
      } finally {
        setIsWaitingForInitialResponse(false);
      }
    }, 300);

    debouncedInitialize();
  }, [searchParams, saveSessionToStorage, sessionId, scenarioInfo]);

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
