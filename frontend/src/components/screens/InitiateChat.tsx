'use client';

import React, { useState, Suspense, useEffect } from "react";
import { Header } from '../Header';
import { Button } from '../ui';
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useScenario } from '@/context/ScenarioContext';
import { ChatModals } from '../ChatModals';
import { storePersona, createConversation } from '@/utils/api';
import { Persona } from '@/utils/api';  // Import the Persona type

interface InitiateChatContentProps {
  systemPromptId?: string;
}

const InitiateChatContent: React.FC<InitiateChatContentProps> = ({ systemPromptId: defaultSystemPromptId }) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customSystemPromptId, setCustomSystemPromptId] = useState(defaultSystemPromptId || "1");
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

  // Function to randomly select 3 prompts
  const getRandomPrompts = () => {
    const shuffled = [...fixedPrompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
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
    console.log('Starting chat with inputMessage:', inputMessage.trim());
    if (persona) {
      try {
        console.log('Prompt, persona, scenarioId, customSystemPromptId:', prompt, persona, scenarioInfo?.id, customSystemPromptId);
        const { id: conversationId } = await createConversation(prompt, scenarioInfo?.id || '', persona, customSystemPromptId);
        const url = `/chat-screen?conversationId=${conversationId}&firstMessage=${encodeURIComponent(prompt)}`;
        router.push(url);
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    }
  };

  const handleStartChat = async () => {

    if (inputMessage.trim() && persona) {
      try {
        const { id: conversationId } = await createConversation(inputMessage.trim(), scenarioInfo?.id || '', persona, customSystemPromptId);
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <div className="flex-shrink-0">
        <Header 
          title={scenarioInfo?.title || "Scenario"} 
          variant="default" 
          showInfoIcon={true}
          onInfoClick={() => setShowInfoPopover(true)}
        />
        {defaultSystemPromptId && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Using custom system prompt</p>
            <p>System Prompt ID: {defaultSystemPromptId}</p>
          </div>
        )}
      </div>

      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="max-w-2xl mx-auto py-12">
          <div className="flex flex-col items-center mb-8">
            <Image
              width={200}
              height={200}
              alt="Union Training Bot"
              src="/images/chat-bot.svg"
              className="mb-6"
            />
            <h2 className="text-pcsprimary-04 dark:text-pcsprimary-02 text-3xl mb-4">Start Training</h2>
            <p className="text-pcsprimary-04 dark:text-pcsprimary-02 text-center text-lg mb-6">
              Choose a prompt below or write your own to start your union training session
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {selectedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="options"
                text={prompt}
                onClick={() => handlePromptSelect(prompt)}
                className="text-sm py-3 px-4 text-left h-full"
              />
            ))}
          </div>
          
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-pcsprimary-04 dark:text-pcsprimary-02">
              <button 
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="underline focus:outline-none"
              >
                {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
              </button>
            </div>
            
            {showAdvancedOptions && (
              <div className="mt-4">
                <label className="block text-sm text-pcsprimary-04 dark:text-pcsprimary-02 mb-2">
                  System Prompt ID:
                </label>
                <input
                  type="text"
                  value={customSystemPromptId}
                  onChange={(e) => setCustomSystemPromptId(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-pcsprimary-02 text-sm p-3 rounded border border-pcsprimary-05 dark:border-pcsprimary-02 focus:outline-none"
                  placeholder="Enter system prompt ID (default: 1)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex-grow mr-4">
                <input
                  className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-pcsprimary-02 text-sm p-3 rounded-full border border-pcsprimary-05 dark:border-pcsprimary-02 focus:outline-none"
                  placeholder="Or type your own union-related question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                />
              </div>
              <Button
                variant="progress"
                text="Start Training"
                onClick={handleStartChat}
                className="text-sm py-3 px-6"
              />
            </div>
          </div>
        </div>
      </div>

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

export const InitiateChat: React.FC = () => {
  const searchParams = useSearchParams();
  const systemPromptId = searchParams.get('systemPromptId');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InitiateChatContent systemPromptId={systemPromptId || undefined} />
    </Suspense>
  );
};
