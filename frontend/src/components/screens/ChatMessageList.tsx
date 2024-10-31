import React from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ActiveChatProps {
  messages: Message[];
  isLoading: boolean;
  isWaitingForInitialResponse: boolean;
}

interface MessageListSkeletonProps {
  messageCount?: number;
}

export const MessageListSkeleton: React.FC<MessageListSkeletonProps> = ({ messageCount = 3 }) => {
  return (
    <div className="flex-grow overflow-y-auto">
      <div className="min-h-full p-4 space-y-6">
        {Array.from({ length: messageCount }).map((_, index) => (
          <div
            key={index}
            className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`relative ${index % 2 === 0 ? 'pl-2' : ''} max-w-xs`}>
              {index % 2 === 0 && (
                <Skeleton className="absolute -left-3 -bottom-1 w-4 h-4 rounded-full" />
              )}
              <Skeleton 
                className={`h-12 w-64 rounded-lg ${
                  index % 2 === 0 ? 'bg-pcsprimary01-light' : 'bg-pcsprimary-02'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MessageList: React.FC<ActiveChatProps> = ({ messages, isLoading, isWaitingForInitialResponse }) => {
  if (messages.length === 0 && (isLoading || isWaitingForInitialResponse)) {
    return <MessageListSkeleton />;
  }

  return (
    <div className="flex-grow overflow-y-auto">
      <div className="min-h-full p-4">
        {messages.map((message) => (
          <div
            key={`message-${message.id}`}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`relative ${message.sender === 'bot' ? 'pl-2' : ''}`}>
              <div
                className={`relative max-w-xs px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-pcsprimary-02 text-white'
                    : 'bg-pcsprimary01-light text-pcsprimary-03'
                }`}
              >
                {message.text}
                <div
                  className={`absolute w-3 h-3 ${
                    message.sender === 'user' ? '-bottom-1.5 right-0' : '-bottom-1.5 left-0'
                  } overflow-hidden`}
                >
                  <div
                    className={`absolute transform ${
                      message.sender === 'user' ? 'rotate-45 origin-bottom-left' : '-rotate-45 origin-bottom-right'
                    } w-4 h-4 ${
                      message.sender === 'user' ? 'bg-pcsprimary-02' : 'bg-pcsprimary01-light'
                    }`}
                    style={{
                      bottom: '50%',
                      [message.sender === 'user' ? 'left' : 'right']: '50%',
                    }}
                  ></div>
                </div>
              </div>
              {message.sender === 'bot' && (
                <Image
                  width={16}
                  height={16}
                  className="absolute -bottom-1 -left-3 rounded-full"
                  alt="Bot Avatar"
                  src="/images/bot-avatar.svg"
                />
              )}
            </div>
          </div>
        ))}
        {(isLoading || isWaitingForInitialResponse) && (
          <div key="loading-indicator" className="flex justify-start mb-4">
            <Image
              width={16}
              height={16}
              className="rounded-full mr-2"
              alt="Bot Avatar"
              src="/images/bot-avatar.svg"
            />
            <div className="relative max-w-xs px-4 py-2 rounded-lg bg-pcsprimary01-light text-pcsprimary-03">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
