'use client';

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { MessageList } from "./ChatMessageList";
import { useChat } from '@/hooks/useChat';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChatInput } from '@/components/ChatInput';
import { ChatModals } from '@/components/ChatModals';
import { useScenario } from '@/context/ScenarioContext';
import { motion } from 'framer-motion';

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

  const { scenarioInfo, persona } = useScenario();

  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

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
    <div className="flex flex-col h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header 
        title={scenarioInfo?.title || "Chat"} 
        variant="default" 
        showInfoIcon={true}
        onInfoClick={() => setShowInfoPopover(true)}
      />
      <main className="flex-grow overflow-hidden">
        <div className="bg-white dark:bg-gray-900 flex flex-col h-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <motion.div 
            className="flex flex-col h-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ErrorBoundary fallback={<div className="text-red-500 dark:text-red-400">An error occurred in the chat. Please refresh the page and try again.</div>}>
              <MessageList 
                messages={currentSession?.messages || []} 
                isLoading={isLoading}
                isWaitingForInitialResponse={isWaitingForInitialResponse}
              />
            </ErrorBoundary>
            <div ref={messagesEndRef} />
          </motion.div>
        </div>
      </main>

      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <motion.div 
            className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={() => conversationId && handleSendMessage(inputMessage, conversationId)}
              onEndChat={handleEndChat}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      </footer>

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
        persona={persona}
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
