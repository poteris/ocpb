'use client';

import React, { Suspense } from 'react';
import { ScenarioSetup } from '@/components/screens/ScenarioSetup/ScenarioSetup';
import { useRouter, useSearchParams } from 'next/navigation';

function ScenarioSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');

  if (!scenarioId) {
    return <div>Error: Scenario ID is missing</div>;
  }

  const handleBack = () => {
    router.push('/');
  };

  return <ScenarioSetup scenarioId={scenarioId} onBack={handleBack} />;
}

export default function ScenarioSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScenarioSetupContent />
    </Suspense>
  );
}
