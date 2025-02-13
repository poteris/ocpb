"use client";

import React, { useState, useRef, useEffect, Suspense, KeyboardEvent } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MessageList } from "../ChatMessageList";
import { useChat } from "@/hooks/useChat";
import { Send, Loader } from "react-feather";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ChatModals } from "@/components/ChatModals";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { scenarioAtom, selectedPersonaAtom } from "@/store";
import ChatScreenSkeleton from "./ChatScreenSkeleton";

const ChatScreenContent: React.FC = () => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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

  const [scenarioInfo] = useAtom(scenarioAtom);
  const [persona] = useAtom(selectedPersonaAtom);

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const doInit = async () => {
      await initializeSession();
      setIsInitializing(false);
    };
    doInit();
  }, [initializeSession]);

  //scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  // focus the input when no longer loading 
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, currentSession?.messages]);


  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, [inputMessage]);

   const handleLocalSend = () => {
    if (inputMessage.trim() && conversationId && scenarioInfo?.id) {
      handleSendMessage(inputMessage, conversationId, scenarioInfo.id);
      setInputMessage("");
      // Note: Re-focus the input for next message
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Keydown sends if user presses Enter (without Shift)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleLocalSend();
    }
  };

  const handleEndChat = () => {
    setShowEndChatModal(true);
  };

  const handleFeedbackClose = async () => {
    setIsExiting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setShowFeedbackPopover(false);
    router.push("/");
  };

  if (isInitializing) {
    return (
      <LoadingScreen
        title="Initializing Chat"
        message="Setting up your training environment..."
      />
    );
  }


  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="flex flex-col h-screen"
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
          <div className="flex flex-col h-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <MessageList
              messages={currentSession?.messages || []}
              isLoading={isLoading}
              isWaitingForInitialResponse={isWaitingForInitialResponse}
            />
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="bg-slate-50 dark:bg-slate-800 py-4 sm:py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative flex-grow">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Type your message..."
                  className="w-full bg-white dark:bg-gray-800 text-sm sm:text-base py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 resize-none overflow-hidden min-h-[40px] max-h-[100px]"
                  rows={1}
                />
                {(inputMessage.trim() || isLoading) && (
                  <button
                    onClick={handleLocalSend}
                    className="absolute right-[1%] top-[10%] flex items-center justify-center p-1.5 rounded-full transition-colors duration-200 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white"
                    aria-label="Send message"
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    {isLoading ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                )}
              </div>
              <Button
                onClick={handleEndChat}
                className="text-sm sm:text-base px-3 sm:px-4 py-2 rounded-full h-[40px] whitespace-nowrap flex-shrink-0"
              >
                End Chat
              </Button>
            </div>
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


export const ChatScreen: React.FC = () => (
  <Suspense fallback={<ChatScreenSkeleton />}>
    <ChatScreenContent />
  </Suspense>
);
