export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatSession {
  id: string;
  conversationId: string;
  messages: Message[];
}