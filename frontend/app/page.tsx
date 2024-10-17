"use client";

import { Welcome } from '@/components/screens/WelcomePage';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  const handleScenarioSelect = (scenarioId: string) => {
    console.log(`Selected scenario: ${scenarioId}`);
    router.push(`/scenario-setup?scenarioId=${scenarioId}`);
  };

  return <Welcome onScenarioSelect={handleScenarioSelect} />;
}
