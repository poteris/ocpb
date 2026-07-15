"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Leaderboard } from "@/components/screens/Leaderboard/Leaderboard";

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams ? searchParams.get("scenarioId") : null;

  return <Leaderboard scenarioId={scenarioId} />;
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardContent />
    </Suspense>
  );
}
