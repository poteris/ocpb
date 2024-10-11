export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export interface ChatSession {
  id: string;
  messages: Message[];
}