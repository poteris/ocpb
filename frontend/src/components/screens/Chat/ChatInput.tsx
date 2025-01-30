import React, { useState, useRef, useEffect } from "react";
import { Send, Loader } from "react-feather";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

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
  isLoading,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const adjustHeight = () => {
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        const newHeight = Math.min(inputRef.current.scrollHeight, 100);
        inputRef.current.style.height = `${newHeight}px`;
      }
    };

    adjustHeight();
  }, [inputMessage]);

  const handleSendMessage = () => {

    if (inputMessage.trim()) {
      onSendMessage();
      setInputMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div className="relative flex-grow">
        <motion.div
          initial={false}
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            placeholder="Type your message..."
            className="w-full bg-white dark:bg-gray-800 text-pcsprimary-05 dark:text-gray-300 text-sm sm:text-base py-2 px-4 rounded-full border border-pcsprimary-05 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pcsprimary-02 dark:focus:ring-pcsprimary-01 transition-all duration-200 resize-none overflow-hidden min-h-[40px] max-h-[100px]"
            rows={1}
          />
          <AnimatePresence>
            {(inputMessage.trim() || isLoading) && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={handleSendMessage}
                className="absolute right-[1%] top-[10%] flex items-center justify-center bg-pcsprimary-03 dark:bg-pcsprimary-02 text-white p-1.5 rounded-full hover:bg-pcsprimary-04 dark:hover:bg-pcsprimary-01 transition-colors duration-200 disabled:opacity-50"
                aria-label="Send message"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <Button
        variant="destructive"
        onClick={onEndChat}
        className="text-sm sm:text-base px-3 sm:px-4 py-2 rounded-full h-[40px] whitespace-nowrap flex-shrink-0"
      >
        End Chat
      </Button>
    </div>
  );
};
