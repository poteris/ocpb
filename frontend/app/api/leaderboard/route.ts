import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService as supabase } from "../service-init";
import { getTenantFromRequest } from "@/lib/tenant";
import { leaderboardRowSchema, LeaderboardResponse } from "@/types/leaderboard";

export async function GET(request: NextRequest) {
  try {
    const organisationId = getTenantFromRequest(request);
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");

    if (!scenarioId) {
      return NextResponse.json({ message: "scenarioId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("scenario_leaderboard")
      .select("user_id, display_name, best_score, attempt_count, best_score_at")
      .eq("scenario_id", scenarioId)
      .eq("organisation_id", organisationId)
      .order("best_score", { ascending: false })
      .order("best_score_at", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return NextResponse.json({ message: "Failed to fetch leaderboard" }, { status: 500 });
    }

    const rows = z.array(leaderboardRowSchema).parse(data ?? []);
    const response: LeaderboardResponse = {
      scenarioId,
      entries: rows.map((row, index) => ({ ...row, rank: index + 1 })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET leaderboard:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
