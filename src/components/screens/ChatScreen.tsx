import { useState, useRef, useEffect, useCallback } from "react";
import { Layout } from '../Layout';
import { InfoPopover, Modal } from '../ui';
import { MessageList } from "./ChatMessageList";
import { useRouter } from '@/utils/router';
import { Info, Mic } from 'react-feather';
import { Button } from '../ui';
import { generateResponse } from '@/utils/api';
import { Message, ChatSession } from '@/types';
import { FeedbackPopover } from './FeedbackScreen';
import analysisData from './analysis.json';

const STORAGE_KEY = 'chatSessions';

export const ChatScreen: React.FC = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { params, navigateTo } = useRouter();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const sessionInitialized = useRef(false);
  const [showFeedbackPopover, setShowFeedbackPopover] = useState(false);

  const saveSessionToStorage = useCallback((session: ChatSession) => {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedSessions = sessions.map((s: ChatSession) => 
      s.id === session.id ? session : s
    );
    if (!sessions.find((s: ChatSession) => s.id === session.id)) {
      updatedSessions.push(session);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
  }, []);

  const addMessage = useCallback((newMessage: Message) => {
    setCurrentSession((prevSession) => {
      if (prevSession) {
        const updatedSession = {
          ...prevSession,
          messages: [...prevSession.messages, newMessage]
        };
        saveSessionToStorage(updatedSession);
        return updatedSession;
      }
      return prevSession;
    });
  }, [saveSessionToStorage]);

  const generateBotResponse = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    try {
      const botResponseText = await generateResponse(userMessage);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
      };
      addMessage(botResponse);
    } catch (error) {
      console.error('Error generating bot response:', error);
      // Optionally, add an error message to the chat
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const initializeSession = useCallback(() => {
    if (sessionInitialized.current) return;

    if (params.sessionId) {
      // Load existing session
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const session = sessions.find((s: ChatSession) => s.id === params.sessionId);
      if (session) {
        setCurrentSession(session);
      } else {
        console.error('Session not found');
        // Handle error - maybe navigate back to history or create a new session
      }
    } else {
      // Create a new chat session
      const newSession: ChatSession = {
        id: Date.now().toString(),
        messages: []
      };

      if (params.firstMessage) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: params.firstMessage.toString(),
          sender: 'user',
        };
        newSession.messages.push(userMessage);
      }

      setCurrentSession(newSession);
      saveSessionToStorage(newSession);

      if (params.firstMessage) {
        generateBotResponse(params.firstMessage.toString());
      }
    }

    sessionInitialized.current = true;
  }, [params.sessionId, params.firstMessage, saveSessionToStorage, generateBotResponse]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
      };
      addMessage(newMessage);
      setInputMessage("");
      generateBotResponse(inputMessage);
    }
  };

  const handleEndChat = () => {
    setShowEndChatModal(true);
  };

  const confirmEndChat = () => {
    setShowEndChatModal(false);
    setShowFeedbackPopover(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackPopover(false);
    navigateTo('history');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  return (
    <Layout>
      <div className="bg-white flex flex-col h-full max-w-md mx-auto">
        {/* Header */}
        <div className="p-4 flex items-center">
          <div className="ml-4">
            <p className="text-pcsprimary-04 text-xs">Scenario: Grievance Handling</p>
          </div>
          <button 
            onClick={() => setShowInfoPopover(true)} 
            className="ml-auto bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
            aria-label="Show information"
          >
            <Info size={18} />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="flex-grow overflow-y-auto">
          <MessageList messages={currentSession?.messages || []} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-pcsprimary02-light p-4 flex items-center">
          <div className="flex-grow mr-2">
            <input
              className="w-full bg-white text-pcsprimary-05 text-xs p-2 rounded-full border border-pcsprimary-05 focus:outline-none"
              placeholder="Start typing ..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <button 
            onClick={handleSendMessage} 
            className="bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
            aria-label="Send message"
          >
            <Mic size={18} />
          </button>
          <Button
            variant="destructive"
            text="End Chat"
            onClick={handleEndChat}
            className="ml-2"
          />
        </div>
      </div>

      {showEndChatModal && (
        <Modal
          isOpen={showEndChatModal}
          onClose={() => setShowEndChatModal(false)}
          title="End Chat"
        >
          <p>Are you sure you want to end this chat?</p>
          <div className="flex justify-end mt-4">
            <Button
              variant="default"
              text="Dismiss"
              onClick={() => setShowEndChatModal(false)}
              className="mr-2"
            />
            <Button
              variant="destructive"
              text="End Chat"
              onClick={confirmEndChat}
            />
          </div>
        </Modal>
      )}

      {showInfoPopover && (
        <InfoPopover onClose={() => setShowInfoPopover(false)} />
      )}

      {showFeedbackPopover && (
        <FeedbackPopover
          onClose={handleFeedbackClose}
          onContinueChat={() => setShowFeedbackPopover(false)}
          score={3}
          analysisData={analysisData}
        />
      )}
    </Layout>
  );
};