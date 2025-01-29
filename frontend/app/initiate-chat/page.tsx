import { Suspense } from 'react';
import { InitiateChat } from '@/components/screens/InitiateChat/InitiateChat';

export default function InitiateChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InitiateChat />
    </Suspense>
  );
}
