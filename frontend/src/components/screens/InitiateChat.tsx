import React, { useState } from "react";
import { Layout } from '../Layout';
import { Button, InfoPopover } from '../ui';
import { Info } from 'react-feather';
import Image from "next/image";

type Screen = 'welcome' | 'scenario-setup' | 'initiate-chat' | 'chat' | 'history';

interface InitiateChatProps {
  navigateTo: (screen: Screen, params?: { firstMessage?: string }) => void;
}

const promptMap = {
  "Grievance handling": "I'm a new union rep and I've just received a grievance from a member about unfair treatment. How should I approach this?",
  "Collective bargaining": "We're preparing for our first round of collective bargaining. What key points should I keep in mind?",
  "Health and safety": "A member has reported unsafe working conditions. What steps should I take to address this issue?",
  "Member recruitment": "I want to increase union membership in my workplace. What strategies can I use to recruit new members?",
  "Representing members": "I need to represent a member in a disciplinary hearing. How can I best prepare for this?",
  "Union organizing": "We're trying to organize a non-union workplace. What are the first steps I should take?",
};

export const InitiateChat: React.FC<InitiateChatProps> = ({ navigateTo }) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const handlePromptSelect = (shortPrompt: string) => {
    const fullPrompt = promptMap[shortPrompt as keyof typeof promptMap];
    navigateTo('chat', { firstMessage: fullPrompt });
  };

  const handleStartChat = () => {
    if (inputMessage.trim()) {
      console.log(inputMessage.trim())
      navigateTo('chat', { firstMessage: inputMessage.trim() });
    } else {
      // Optionally, you can show an error message or tooltip here
      console.log("Please enter a message or select a prompt");
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