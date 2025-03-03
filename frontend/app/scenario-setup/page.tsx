"use client";

import React, { Suspense } from "react";
import ScenarioSetup from "@/components/screens/ScenarioSetup/ScenarioSetup";
import { useSearchParams } from "next/navigation";

function ScenarioSetupContent() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams ? searchParams.get('scenarioId') : null;

  if (!scenarioId) {
    return <div>Error: Scenario ID is missing</div>;
  }

  return <ScenarioSetup scenarioId={scenarioId} />;
}

export default function ScenarioSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScenarioSetupContent />
    </Suspense>
  );
}
