"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Send, Loader } from 'lucide-react';
import { useSearchParams } from "next/navigation";
import { Input } from '@/components/ui/Input';

export interface ConversationData {
  messages: Message[];
  conversationId: string;
  scenarioId: string;
  userId: string;
  personaId: string;
  systemPromptId: string;
  feedbackPromptId: string;
}

interface Message {
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  role: string;
}

const ChatScreen = () => {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");

  // Fetch initial chat data
  useEffect(() => {
    const fetchChat = async () => {
      if (!conversationId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get<ConversationData>(`/api/chat/${conversationId}`);
        setConversationData(response.data);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChat();
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationData?.messages]);

  // Send message handler
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationData?.conversationId || isLoading) return;

    try {
      setIsLoading(true);
      
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        conversation_id: conversationData.conversationId,
        created_at: new Date().toISOString(),
        role: 'user'
      };
      
      // Update state with user message
      setConversationData(prev => ({
        ...prev!,
        messages: [...prev!.messages, userMessage]
      }));
      setInputMessage('');

      // Send to API
      const response = await axios.post<Message>('/api/chat/send-user-message', {
        conversationId: conversationData.conversationId,
        scenario_id: conversationData.scenarioId,
        content: inputMessage
      });

      if (response.status === 200) {
        // Fetch the updated conversation data after bot response
        const updatedConversation = await axios.get<ConversationData>(`/api/chat/${conversationData.conversationId}`);
        setConversationData(updatedConversation.data);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the failed message from the state
      setConversationData(prev => ({
        ...prev!,
        messages: prev!.messages.slice(0, -1) // Remove the last message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white w-1/2 mx-auto">
      <header className="p-4 border-b">
        <h1 className="text-xl font-semibold">Rep Coach</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 ">
        {conversationData?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-slate-50 text-black'
                  : 'bg-primary text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[160px] p-2 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-10 px-4"
          >
            {isLoading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;