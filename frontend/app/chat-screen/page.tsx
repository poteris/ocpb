import { Suspense } from 'react';
import { ChatScreen } from '@/components/screens/ChatScreen';

export default function ChatScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatScreen />
    </Suspense>
  );
}
