import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest } from "@/lib/tenant";
import { getScenarioLeaderboard } from "@/lib/server/db";
import { buildLeaderboardResponse } from "@/lib/server/leaderboard";

export async function GET(request: NextRequest) {
  try {
    const organisationId = getTenantFromRequest(request);
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");
    const userId = searchParams.get("userId");

    if (!scenarioId) {
      return NextResponse.json({ message: "scenarioId is required" }, { status: 400 });
    }

    const rankedEntries = await getScenarioLeaderboard(scenarioId, organisationId);
    const response = buildLeaderboardResponse(scenarioId, rankedEntries, userId);

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET leaderboard:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
