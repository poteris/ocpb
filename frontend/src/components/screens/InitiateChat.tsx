'use client';

import React, { useState } from "react";
import { Layout } from '../Layout';
import { Button, InfoPopover } from '../ui';
import { Info } from 'react-feather';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { promptMap } from '@/utils/promptMap';

export const InitiateChat: React.FC = () => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const router = useRouter();

  const handlePromptSelect = (shortPrompt: string) => {
    router.push(`/chat-screen?shortPrompt=${encodeURIComponent(shortPrompt)}`);
  };

  const handleStartChat = () => {
    if (inputMessage.trim()) {
      router.push(`/chat-screen?firstMessage=${encodeURIComponent(inputMessage.trim())}`);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 flex items-center">
          <div className="ml-4">
            <p className="text-pcsprimary-04 text-xs">Scenario: Union Rep Training</p>
          </div>
          <button 
            onClick={() => setShowInfoPopover(true)} 
            className="ml-auto bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
            aria-label="Show information"
          >
            <Info size={18} />
          </button>
        </div>

        {/* Chat initiation content */}
        <div className="flex-grow flex flex-col justify-between p-4">
          <div className="flex flex-col items-center">
            <Image
              width={150}
              height={150}
              alt="Union Training Bot"
              src="/images/chat-bot.svg"
              className="mb-4"
            />
            <h2 className="text-pcsprimary-04 text-xl mb-2">Start Training</h2>
            <p className="text-pcsprimary-04 text-center text-sm mb-4">
              Choose a prompt below or write your own to start your union training session
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.keys(promptMap).map((shortPrompt, index) => (
              <Button
                key={index}
                variant="options"
                text={shortPrompt}
                onClick={() => handlePromptSelect(shortPrompt)}
                className="text-sm py-1 px-2"
              />
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="bg-pcsprimary02-light p-4 flex items-center">
          <div className="flex-grow mr-2">
            <input
              className="w-full bg-white text-pcsprimary-05 text-xs p-2 rounded-full border border-pcsprimary-05 focus:outline-none"
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

      {showInfoPopover && (
        <InfoPopover onClose={() => setShowInfoPopover(false)} />
      )}
    </Layout>
  );
};
