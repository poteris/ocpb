import React, { useState } from 'react';
import { Send } from 'react-feather';
import { Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isFocused, setIsFocused] = useState(false);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage();
      setInputMessage(''); // Clear the input after sending
    }
  };

  return (
    <div className="bg-pcsprimary02-light dark:bg-pcsprimary-05 p-3 sm:p-4 sticky bottom-0 z-10 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-grow w-full sm:w-auto relative">
          <motion.div
            initial={false}
            animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <input
              className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-gray-300 text-sm sm:text-base p-3 pr-24 rounded-full border border-pcsprimary-05 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pcsprimary-02 dark:focus:ring-pcsprimary-01 transition-all duration-200"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage();
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
            />
          </motion.div>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <AnimatePresence>
              {inputMessage.trim() && (
                <motion.button 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={handleSendMessage} 
                  className="bg-pcsprimary-03 dark:bg-pcsprimary-02 text-white p-2 rounded-full hover:bg-pcsprimary-04 dark:hover:bg-pcsprimary-01 transition-colors duration-200 disabled:opacity-50"
                  aria-label="Send message"
                  disabled={isLoading}
                >
                  <Send size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Button
          variant="destructive"
          text="End Chat"
          onClick={onEndChat}
          className="text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto"
        />
      </div>
    </div>
  );
};
