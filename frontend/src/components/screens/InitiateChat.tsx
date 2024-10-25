'use client';

import React, { useState, Suspense, useEffect } from "react";
import { Header } from '../Header';
import { Button } from '@/components/ui';
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useScenario } from '@/context/ScenarioContext';
import { ChatModals } from '../ChatModals';
import { createConversation, storePersona } from '@/utils/api';
import { Persona } from '@/utils/api';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui';

interface InitiateChatContentProps {
  systemPromptId?: string;
}

const InitiateChatContent: React.FC<InitiateChatContentProps> = ({ systemPromptId: defaultSystemPromptId }) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();
  const { scenarioInfo, persona, setPersona } = useScenario();

  // New array of fixed prompts
  const fixedPrompts = [
    "Hi, can I interrupt you for a sec?",
    "Hey, how are you doing?",
    "Hey mate, sorry to bother you - how's it going?",
    "What are you up to?",
    "Hi!",
    "Heya mate - what's new?"
  ];

  // Function to randomly select prompts
  const getRandomPrompts = () => {
    const shuffled = [...fixedPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4); // Select 4 prompts instead of 3
  };

  // State to store the randomly selected prompts
  const [selectedPrompts] = useState(getRandomPrompts());

  useEffect(() => {
    const storedPersona = localStorage.getItem('selectedPersona');
    if (storedPersona) {
      const parsedPersona: Persona = JSON.parse(storedPersona);
      setPersona(parsedPersona);
    }
  }, [setPersona]);

  const handlePromptSelect = async (prompt: string) => {
    if (persona) {
      try {
        // Store the persona
        await storePersona(persona);

        const { id: conversationId } = await createConversation(prompt, scenarioInfo?.id || '', persona, defaultSystemPromptId);
        const url = `/chat-screen?conversationId=${conversationId}&firstMessage=${encodeURIComponent(prompt)}`;
        router.push(url);

        // Clear the stored persona from localStorage
        localStorage.removeItem('selectedPersona');
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    }
  };

  const handleStartChat = async () => {
    if (inputMessage.trim() && persona) {
      try {
        // Store the persona
        await storePersona(persona);

        const { id: conversationId } = await createConversation(inputMessage.trim(), scenarioInfo?.id || '', persona, defaultSystemPromptId);
        const url = `/chat-screen?conversationId=${conversationId}&firstMessage=${encodeURIComponent(inputMessage.trim())}`;
        router.push(url);

        // Clear the stored persona from localStorage
        localStorage.removeItem('selectedPersona');
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-shrink-0">
        <Header 
          title={scenarioInfo?.title || "Scenario"} 
          variant="default" 
          showInfoIcon={true}
          onInfoClick={() => setShowInfoPopover(true)}
        />
      </div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-between py-8">
          <div>
            <motion.div 
              className="flex flex-col items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                width={250}
                height={250}
                alt="Union Training Bot"
                src="/images/chat-bot.svg"
                className="mb-8"
              />
              <h2 className="text-pcsprimary-04 dark:text-pcsprimary-02 text-4xl font-bold mb-6">Start Training</h2>
              <p className="text-pcsprimary-04 dark:text-pcsprimary-02 text-center text-xl mb-8">
                Choose a prompt below or write your own to start your union training session
              </p>
            </motion.div>
            
            <motion.div 
              className="grid gap-4 sm:grid-cols-2 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {selectedPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="options"
                    text={prompt}
                    onClick={() => handlePromptSelect(prompt)}
                    className="text-lg py-4 px-6 text-left h-full w-full"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-gray-300 text-sm sm:text-base p-3 pr-16 rounded-full border border-pcsprimary-05 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pcsprimary-02 dark:focus:ring-pcsprimary-01 transition-all duration-200"
                placeholder="Start training..."
              />
              <Button
                variant="progress"
                text="Start"
                onClick={handleStartChat}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-base py-2 px-4 rounded-full"
                disabled={!inputMessage.trim()}
              />
            </div>
          </motion.div>
        </div>
      </main>

      <ChatModals
        showInfoPopover={showInfoPopover}
        setShowInfoPopover={setShowInfoPopover}
        scenarioInfo={scenarioInfo}
        persona={persona}
        showEndChatModal={false}
        setShowEndChatModal={() => {}}
        confirmEndChat={() => {}}
        showFeedbackPopover={false}
        setShowFeedbackPopover={() => {}}
        handleFeedbackClose={() => {}}
      />
    </div>
  );
};

const InitiateChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-shrink-0">
        <Skeleton className="h-16 w-full" />
      </div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-between py-8">
          <div>
            <div className="flex flex-col items-center mb-12">
              <Skeleton className="w-64 h-64 mb-8 rounded-full" />
              <Skeleton className="h-10 w-3/4 mb-6" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-5/6 mb-8" />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 mb-12">
              {[1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

export const InitiateChat: React.FC = () => {
  const searchParams = useSearchParams();
  const systemPromptId = searchParams.get('systemPromptId');

  return (
    <Suspense fallback={<InitiateChatSkeleton />}>
      <InitiateChatContent systemPromptId={systemPromptId || undefined} />
    </Suspense>
  );
};
