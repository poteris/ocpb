"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { SendIcon } from 'lucide-react';
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
// import { v4 as uuidv4 } from 'uuid';


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
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false)

  const router = useRouter()


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
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    

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
        messages: prev!.messages.slice(0, -1) 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndChat = () => {
    setIsEndChatModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsEndChatModalOpen(false)
  }

  const handleConfirmEndChat = () => {
    setIsEndChatModalOpen(false)
    router.push(`/feedback?conversationId=${conversationData?.conversationId}`)
  }




  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
    <div className="flex-grow overflow-auto mb-4">
      {conversationData?.messages.map((m) => (
        <div key={m.id} className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}>
          <span
            className={` inline-block p-2 rounded-lg ${m.role === "user" ? "bg-slate-50 text-black" : "bg-primary text-white"}`}
          >
            {m.content}
          </span>
        </div>
      ))}
    </div>
    <form onSubmit={handleSendMessage} className="flex space-x-2 rounded-lg " >
      <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Type your message..." className="flex-grow" />
      <Button type="submit" size="icon">
        <SendIcon className="h-4 w-4" />
      </Button>
      <Button onClick={handleEndChat} variant="destructive">
        End Chat
      </Button>
    </form>

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

export default ChatScreen;