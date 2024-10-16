'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Layout } from '@/components/Layout';
import { InfoPopover, Modal } from '@/components/ui';
import { MessageList } from "./ChatMessageList";
import { useRouter, useSearchParams } from 'next/navigation';
import { Info, Mic } from 'react-feather';
import { Button } from '@/components/ui';
import { ChatSession, Message } from '@/types/chat';
import { FeedbackPopover } from './FeedbackScreen';
import analysisData from './analysis.json';
import { createAssistant, createThread, sendMessage, runAssistant, getThreadMessages } from '@/utils/api';

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

  const handleSendMessage = async (message: string) => {
    if (!threadId || !message.trim()) return;

    setIsLoading(true);
    try {
      // Add user message to the UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
      };

      // Send message to API
      await sendMessage(threadId, message);
      
      // Run the assistant
      await runAssistant(threadId);
      
      // Fetch updated messages
      const messages = await getThreadMessages(threadId);
      
      // Update the session with all messages
      setCurrentSession(prev => ({
        ...prev!,
        messages: messages.map((m: any) => ({
          id: m.id,
          text: m.content,
          sender: m.role === 'user' ? 'user' : 'bot'
        }))
      }));

      // Clear input
      setInputMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally, add an error message to the chat
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSession = useCallback(async () => {
    if (sessionInitialized.current) return;

    let thread;
    if (sessionId) {
      // Load existing session
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const session = sessions.find((s: ChatSession) => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
        setThreadId(session.threadId);
        setAssistantId(session.assistantId);
        thread = { id: session.threadId };
      } else {
        console.error('Session not found');
        // Handle error - maybe navigate back to history or create a new session
      }
    } else {
      // Create a new assistant and chat session
      try {
        const assistant = await createAssistant('My Assistant', 'A helpful assistant', 'gpt-3.5-turbo');
        setAssistantId(assistant.assistant_id);
        
        thread = await createThread(assistant.assistant_id);
        const newSession: ChatSession = {
          id: Date.now().toString(),
          threadId: thread.id,
          assistantId: assistant.assistant_id,
          messages: []
        };
        setCurrentSession(newSession);
        setThreadId(thread.id);
        saveSessionToStorage(newSession);
      } catch (error) {
        console.error('Error creating assistant or thread:', error);
        // Handle error - maybe show an error message to the user
      }
    }

    if (firstMessage && thread) {
      await handleSendMessage(firstMessage);
    }

    sessionInitialized.current = true;
  }, [sessionId, firstMessage, saveSessionToStorage, handleSendMessage]);

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
    router.push('/history');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  return (
    <Layout>
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
          <MessageList messages={currentSession?.messages || []} isLoading={isLoading} />
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            />
          </div>
          <button 
            onClick={() => handleSendMessage(inputMessage)} 
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
    </Layout>
  );
};

export const ChatScreen: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatScreenContent />
    </Suspense>
  );
};
