import React from 'react';
import { Mic } from 'react-feather';
import { Button } from '@/components/ui';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  onEndChat: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  onEndChat,
  isLoading
}) => {
  const handleSendMessage = () => {
    onSendMessage();
    setInputMessage(''); // Clear the input after sending
  };

  return (
    <div className="bg-pcsprimary02-light dark:bg-pcsprimary-05 p-2 sm:p-4 flex items-center sticky bottom-0 z-10">
      <div className="flex-grow mr-2 flex items-center">
        <input
          className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-gray-300 text-xs sm:text-sm p-2 rounded-full border border-pcsprimary-05 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pcsprimary-02 dark:focus:ring-pcsprimary-01"
          placeholder="Start typing ..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage} 
          className="bg-transparent border-none cursor-pointer text-pcsprimary-03 dark:text-pcsprimary-02 hover:text-pcsprimary-02 dark:hover:text-pcsprimary-01 transition-colors ml-2"
          aria-label="Send message"
          disabled={isLoading}
        >
          <Mic size={18} />
        </button>
      </div>
      <Button
        variant="destructive"
        text="End Chat"
        onClick={onEndChat}
        className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
      />
    </div>
  );
};
