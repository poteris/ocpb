"use client";

import { Welcome } from '@/components/screens/WelcomePage';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  const handleScenarioSelect = () => {
    // Replace with the actual route you want to navigate to
    router.push('/scenario-setup');
  };

  return <Welcome onScenarioSelect={handleScenarioSelect} />;
}
