import { Suspense } from 'react';
import { EvalsScreen } from '@/components/screens/Evals/EvalsScreen';

export default function EvalsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EvalsScreen />
    </Suspense>
  );
}
