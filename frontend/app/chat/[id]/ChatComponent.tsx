"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LogOut, SendHorizontal } from "lucide-react"
import { ChatInput } from "@/components/ChatInput/ChatInput"
import { ConversationData, Message } from "./page";
import { v4 as uuidv4 } from 'uuid';
async function getConversationData(conversationId: string): Promise<ConversationData | null> {
  try {
    const response = await axios.get<ConversationData>(`/api/chat/${conversationId}`);
    return {...response.data, id: conversationId};
  }   catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}

async function sendUserMessage(conversationId: string, content: string, scenarioId: string) {
  try {
    const response = await axios.post<Message>('/api/chat/send-user-message', {
      conversationId,
      content,
      scenario_id: scenarioId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error; // Propagate error to be handled by the caller
  }
}

interface ChatComponentProps {
  conversationData: ConversationData;
}

const ChatComponent = ({ conversationData: initialConversationData }: ChatComponentProps) => {
  const [conversationData, setConversationData] = useState<ConversationData>(initialConversationData);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Refocus input after messages update
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationData?.messages]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!inputMessage.trim() || !conversationData?.conversationId || isLoading) return;

    try {
      setIsLoading(true);

      // Create user message
      const userMessage: Message = {
        id: uuidv4(), // NOTE: this should be set by the db
        content: inputMessage,
        conversation_id: conversationData.conversationId,
        created_at: new Date().toISOString(), // NOTE: this should be set by the db
        role: 'user'
      };

      // Update state with user message
      setConversationData(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }));
      setInputMessage('');
      
 
      await sendUserMessage(
        conversationData.conversationId, 
        inputMessage, 
        conversationData.scenarioId
      );
      
      // Once successfully sent, fetch the updated conversation
      const updatedConversation = await getConversationData(conversationData.id);
      
      if (updatedConversation) {
        setConversationData(updatedConversation);
      }
      
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error to the user (could implement a toast notification here)
    } finally {
      setIsLoading(false);
      // Refocus input after sending message
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleEndChat = () => {
    setIsEndChatModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsEndChatModalOpen(false);
  }

  const handleConfirmEndChat = () => {
    setIsEndChatModalOpen(false);
    router.push(`/feedback?conversationId=${conversationData?.conversationId}`);
  }

  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto w-full mt-10 grid grid-rows-[1fr_auto] gap-4 h-full">
        {/* Messages Container */}
        <div className="overflow-auto space-y-4">
          {conversationData?.messages.map((m) => (
            <div
              key={m.id}
              className={`grid ${m.role === "user" ? "justify-items-end" : "justify-items-start"}`}
            >
              <span
                className={`p-4 rounded-lg text-sm w-fit max-w-[600px] break-words ${m.role === "user"
                  ? "bg-primary-light text-black"
                  : "bg-primary text-white"
                  }`}
              >
                {m.content}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className="grid grid-cols-[1fr_auto] gap-3 mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="grid grid-cols-[1fr_auto] gap-3"
          >
            <ChatInput
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="text-base py-2 px-4 rounded-full whitespace-nowrap flex items-center justify-center text-sm"
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
              <SendHorizontal className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <Button
            onClick={handleEndChat}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <LogOut />
          </Button>
        </div>
      </div>

      <Dialog open={isEndChatModalOpen} onOpenChange={setIsEndChatModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Chat</DialogTitle>
            <DialogDescription>Are you sure you want to end this chat?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              No
            </Button>
            <Button onClick={handleConfirmEndChat}>Yes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatComponent;