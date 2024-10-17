'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Header } from '@/components/Header';
import { InfoPopover, Modal } from '@/components/ui';
import { MessageList } from "./ChatMessageList";
import { useRouter, useSearchParams } from 'next/navigation';
import { Info, Mic } from 'react-feather';
import { Button } from '@/components/ui';
import { ChatSession, Message } from '@/types/chat';
import { FeedbackPopover } from './FeedbackScreen';
import analysisData from './analysis.json';
import { createThread, sendMessage } from '@/utils/api';
import { promptMap } from '@/utils/promptMap';
import { debounce } from 'lodash';

const STORAGE_KEY = 'chatSessions';

const ChatScreenContent: React.FC = () => {
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const firstMessage = searchParams.get('firstMessage');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const sessionInitialized = useRef(false);
  const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [personaId, setPersonaId] = useState<string | null>(null);

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

  const handleSendMessage = async (message: string, threadId: string) => {
    console.log('handleSendMessage called with threadId:', threadId, 'and message:', message);
    if (!threadId || !message.trim()) {
      console.error('ThreadId is missing or message is empty');
      return;
    }

    setIsLoading(true);
    try {
      // Add user message to the UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
      };
      setCurrentSession(prev => ({
        ...prev!,
        messages: [...(prev?.messages || []), userMessage]
      }));

      // Send message to API and get the response
      const response = await sendMessage(threadId, message);
      
      if (response && response.result) {
        // Update the session with the assistant's response
        setCurrentSession(prev => ({
          ...prev!,
          messages: [
            ...(prev?.messages || []),
            {
              id: response.result.id,
              text: response.result.content,
              sender: 'bot'
            }
          ]
        }));
      } else {
        console.error('Unexpected response format:', response);
        // Handle the error appropriately, maybe set an error state
      }

      // Clear input
      setInputMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, add an error message to the chat
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

  const initializeSession = useCallback(
    debounce(async () => {
      if (sessionInitialized.current || isInitializing) return;
      setIsInitializing(true);

      try {
        const shortPrompt = searchParams.get('shortPrompt');
        const firstMessageParam = searchParams.get('firstMessage');
        const initialMessage = shortPrompt ? promptMap[shortPrompt] : firstMessageParam;
        const personaIdParam = searchParams.get('personaId');
        setPersonaId(personaIdParam);

        if (sessionId) {
          // Load existing session
          const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const session = sessions.find((s: ChatSession) => s.id === sessionId);
          if (session) {
            setCurrentSession(session);
            setThreadId(session.threadId);
          } else {
            console.error('Session not found');
            // Handle error - maybe navigate back to history or create a new session
          }
        } else {
          try {
            const threadResponse = await createThread(initialMessage || '', personaIdParam || '');
            if (!threadResponse || !threadResponse.id) {
              throw new Error('Failed to create thread');
            }
            const threadId = threadResponse.id;

            setThreadId(threadId);
            const newSession: ChatSession = {
              id: Date.now().toString(),
              threadId: threadId,
              messages: initialMessage ? [{ id: `first-${Date.now()}`, text: initialMessage, sender: 'user' }] : []
            };
            setCurrentSession(newSession);
            saveSessionToStorage(newSession);

            if (initialMessage) {
              await handleInitialMessage(threadId, initialMessage);
            }
          } catch (error) {
            console.error('Error creating thread:', error);
            // Handle the error appropriately, maybe set an error state
          }
        }

        sessionInitialized.current = true;
      } catch (error) {
        console.error('Error initializing session:', error);
        // Handle the error appropriately
      } finally {
        setIsInitializing(false);
      }
    }, 300),
    [sessionId, searchParams, saveSessionToStorage]
  );

  const handleInitialMessage = async (threadId: string, message: string) => {
    setIsLoading(true);
    try {
      const response = await sendMessage(threadId, message);
      
      if (response && response.result) {
        setCurrentSession(prevSession => {
          if (!prevSession) return null;
          const newMessage: Message = {
            id: response.result.id,
            text: response.result.content,
            sender: 'bot'
          };
          return {
            ...prevSession,
            messages: [...prevSession.messages, newMessage]
          };
        });
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error sending initial message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const handleEndChat = () => {
    setShowEndChatModal(true);
  };

  const confirmEndChat = () => {
    setShowEndChatModal(false);
    setShowFeedbackPopover(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackPopover(false);
    router.push('/');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Scenario: Grievance Handling" variant="default" />
      <div className="bg-white flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 flex items-center">
          <div className="ml-4">
            <p className="text-pcsprimary-04 text-xs">Scenario: Grievance Handling</p>
          </div>
          <button 
            onClick={() => setShowInfoPopover(true)} 
            className="ml-auto bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
            aria-label="Show information"
          >
            <Info size={18} />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="flex-grow overflow-y-auto">
          <MessageList 
            messages={currentSession?.messages || []} 
            isLoading={isLoading} 
            firstMessage={firstMessage}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-pcsprimary02-light p-4 flex items-center">
          <div className="flex-grow mr-2">
            <input
              className="w-full bg-white text-pcsprimary-05 text-xs p-2 rounded-full border border-pcsprimary-05 focus:outline-none"
              placeholder="Start typing ..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && threadId && handleSendMessage(inputMessage, threadId)}
            />
          </div>
          <button 
            onClick={() => threadId && handleSendMessage(inputMessage, threadId)} 
            className="bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
            aria-label="Send message"
          >
            <Mic size={18} />
          </button>
          <Button
            variant="destructive"
            text="End Chat"
            onClick={handleEndChat}
            className="ml-2"
          />
        </div>
      </div>

      {showEndChatModal && (
        <Modal
          isOpen={showEndChatModal}
          onClose={() => setShowEndChatModal(false)}
          title="End Chat"
        >
          <p>Are you sure you want to end this chat?</p>
          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              text="Dismiss"
              onClick={() => setShowEndChatModal(false)}
              className="mr-2"
            />
            <Button
              variant="destructive"
              text="End Chat"
              onClick={confirmEndChat}
            />
          </div>
        </Modal>
      )}

      {showInfoPopover && (
        <InfoPopover onClose={() => setShowInfoPopover(false)} />
      )}

      {showFeedbackPopover && (
        <FeedbackPopover
          onClose={handleFeedbackClose}
          onContinueChat={() => setShowFeedbackPopover(false)}
          score={3}
          analysisData={analysisData}
        />
      )}
    </div>
  );
};

export const ChatScreen: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatScreenContent />
    </Suspense>
  );
};
