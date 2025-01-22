'use client';

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { MessageList, MessageListSkeleton } from "./ChatMessageList";
import { useChat } from '@/hooks/useChat';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChatInput } from '@/components/ChatInput';
import { ChatModals } from '@/components/ChatModals';
import { useScenario } from '@/context/ScenarioContext';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui';
import { LoadingScreen } from '@/components/LoadingScreen';

const ChatScreenSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-shrink-0">
        <Skeleton className="h-16 w-full" />
      </div>
      
      <main className="flex-grow overflow-hidden">
        <div className="bg-white dark:bg-gray-900 flex flex-col h-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="flex flex-col h-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto w-full pt-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </footer>
    </div>
  );
};

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
  const [isExiting, setIsExiting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isInitializing) return;
    
    const initialize = async () => {
      try {
        await initializeSession();
      } finally {
        setTimeout(() => setIsInitializing(false), 500);
      }
    };

    initialize();
  }, [initializeSession, isInitializing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  const handleEndChat = () => setShowEndChatModal(true);

  const handleFeedbackClose = async () => {
    setIsExiting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setShowFeedbackPopover(false);
    router.push('/');
  };

  if (isInitializing) {
    return (
      <LoadingScreen 
        title="Initialising Chat"
        message="Setting up your training environment..."
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="flex flex-col h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
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
                {!isInitializing ? (
                  <MessageList 
                    messages={currentSession?.messages || []} 
                    isLoading={isLoading}
                    isWaitingForInitialResponse={isWaitingForInitialResponse}
                  />
                ) : (
                  <MessageListSkeleton messageCount={3} />
                )}
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
                onSendMessage={() => conversationId && scenarioInfo?.id && handleSendMessage(inputMessage, conversationId, scenarioInfo?.id)}
                onEndChat={handleEndChat}
                isLoading={isLoading}
              />
            </motion.div>
          </div>
        </footer>

        <ChatModals
          showEndChatModal={showEndChatModal}
          setShowEndChatModal={setShowEndChatModal}
          showInfoPopover={showInfoPopover}
          setShowInfoPopover={setShowInfoPopover}
          showFeedbackPopover={showFeedbackPopover}
          setShowFeedbackPopover={setShowFeedbackPopover}
          handleFeedbackClose={handleFeedbackClose}
          scenarioInfo={scenarioInfo}
          persona={persona}
          conversationId={conversationId}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export const ChatScreen: React.FC = () => {
  return (
    <Suspense fallback={<ChatScreenSkeleton />}>
      <ChatScreenContent />
    </Suspense>
  );
};
