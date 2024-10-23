'use client';

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { MessageList } from "./ChatMessageList";
import { useChat } from '@/hooks/useChat';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChatInput } from '@/components/ChatInput';
import { ChatModals } from '@/components/ChatModals';
import { useScenario } from '@/context/ScenarioContext';

const ChatScreenContent: React.FC = () => {
  const {
    currentSession,
    conversationId,
    isLoading,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    initializeSession,
    isWaitingForInitialResponse,
  } = useChat();

  const { scenarioInfo, personaInfo } = useScenario();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstMessage = searchParams.get('firstMessage');
    if (firstMessage) {
      const decodedMessage = decodeURIComponent(firstMessage);
      initializeSession(decodedMessage);
      // Remove the firstMessage from the URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('firstMessage');
      router.replace(`/chat-screen?${newSearchParams.toString()}`, { scroll: false });
    } else {
      // Redirect to the welcome screen if there's no firstMessage
      router.replace('/');
    }
  }, [initializeSession, searchParams, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  const handleEndChat = () => setShowEndChatModal(true);

  const confirmEndChat = () => {
    setShowEndChatModal(false);
    setShowFeedbackPopover(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackPopover(false);
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <Header 
        title={scenarioInfo?.title || "Chat"} 
        variant="default" 
        showInfoIcon={true}
        onInfoClick={() => setShowInfoPopover(true)}
      />
      <div className="flex-grow overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 flex flex-col h-full max-w-2xl mx-auto px-4">
          <ErrorBoundary fallback={<div className="text-red-500 dark:text-red-400">An error occurred in the chat. Please refresh the page and try again.</div>}>
            <MessageList 
              messages={currentSession?.messages || []} 
              isLoading={isLoading}
              isWaitingForInitialResponse={isWaitingForInitialResponse}
            />
          </ErrorBoundary>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={() => conversationId && handleSendMessage(inputMessage, conversationId)}
        onEndChat={handleEndChat}
        isLoading={isLoading}
      />

      <ChatModals
        showEndChatModal={showEndChatModal}
        setShowEndChatModal={setShowEndChatModal}
        confirmEndChat={confirmEndChat}
        showInfoPopover={showInfoPopover}
        setShowInfoPopover={setShowInfoPopover}
        showFeedbackPopover={showFeedbackPopover}
        setShowFeedbackPopover={setShowFeedbackPopover}
        handleFeedbackClose={handleFeedbackClose}
        scenarioInfo={scenarioInfo}
        personaInfo={personaInfo}
      />
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
