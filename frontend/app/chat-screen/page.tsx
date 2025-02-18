import { Suspense } from 'react';
import  ChatScreen  from '@/components/screens/Chat/ChatScreen';

export default function ChatScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatScreen />
    </Suspense>
  );
}
