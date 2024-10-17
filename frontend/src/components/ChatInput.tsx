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
}) => (
  <div className="bg-pcsprimary02-light p-2 sm:p-4 flex items-center sticky bottom-0 z-10">
    <div className="flex-grow mr-2 flex items-center">
      <input
        className="w-full bg-white text-pcsprimary-05 text-xs sm:text-sm p-2 rounded-full border border-pcsprimary-05 focus:outline-none"
        placeholder="Start typing ..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
        disabled={isLoading}
      />
      <button 
        onClick={onSendMessage} 
        className="bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors ml-2"
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
