'use client';

import React, { useState, Suspense } from "react";
import { Header } from '../Header';
import { Button } from '../ui';
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { useScenario } from '@/context/ScenarioContext';
import { ChatModals } from '../ChatModals';

interface InitiateChatContentProps {
  systemPromptId?: string;
}

const InitiateChatContent: React.FC<InitiateChatContentProps> = ({ systemPromptId }) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();
  const { scenarioInfo, personaInfo } = useScenario();

  const handlePromptSelect = (prompt: string) => {
    const url = `/chat-screen?scenarioId=${scenarioInfo?.id || ''}&personaId=${personaInfo?.id || ''}&firstMessage=${encodeURIComponent(prompt)}`;
    if (systemPromptId) {
      router.push(`${url}&systemPromptId=${systemPromptId}`);
    } else {
      router.push(url);
    }
  };

  const handleStartChat = () => {
    if (inputMessage.trim()) {
      const url = `/chat-screen?scenarioId=${scenarioInfo?.id || ''}&personaId=${personaInfo?.id || ''}&firstMessage=${encodeURIComponent(inputMessage.trim())}`;
      if (systemPromptId) {
        router.push(`${url}&systemPromptId=${systemPromptId}`);
      } else {
        router.push(url);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header 
        title={scenarioInfo?.title || "Scenario"} 
        variant="default" 
        showInfoIcon={true}
        onInfoClick={() => setShowInfoPopover(true)}
      />
      {systemPromptId && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Using custom system prompt</p>
          <p>System Prompt ID: {systemPromptId}</p>
        </div>
      )}
      <div className="flex flex-col h-full max-w-md mx-auto">
        <div className="flex-grow flex flex-col justify-between p-4">
          <div className="flex flex-col items-center">
            <Image
              width={150}
              height={150}
              alt="Union Training Bot"
              src="/images/chat-bot.svg"
              className="mb-4"
            />
            <h2 className="text-pcsprimary-04 dark:text-pcsprimary-02 text-xl mb-2">Start Training</h2>
            <p className="text-pcsprimary-04 dark:text-pcsprimary-02 text-center text-sm mb-4">
              Choose a prompt below or write your own to start your union training session
            </p>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            {scenarioInfo?.prompts?.map((prompt, index) => (
              <Button
                key={index}
                variant="options"
                text={prompt}
                onClick={() => handlePromptSelect(prompt)}
                className="text-sm py-2 px-4 text-left"
              />
            ))}
          </div>
        </div>

        <div className="bg-pcsprimary02-light dark:bg-pcsprimary-05 p-4 flex items-center">
          <div className="flex-grow mr-2">
            <input
              className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-pcsprimary-02 text-xs p-2 rounded-full border border-pcsprimary-05 dark:border-pcsprimary-02 focus:outline-none"
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
            className="ml-2 text-sm py-1 px-2"
          />
        </div>
      </div>

      <ChatModals
        showInfoPopover={showInfoPopover}
        setShowInfoPopover={setShowInfoPopover}
        scenarioInfo={scenarioInfo}
        personaInfo={personaInfo}
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
