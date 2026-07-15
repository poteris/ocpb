import {
  LEADERBOARD_TOP_N,
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardStats,
} from "@/types/leaderboard";

function computeStats(rankedEntries: LeaderboardEntry[]): LeaderboardStats {
  const playerCount = rankedEntries.length;
  if (playerCount === 0) {
    return { playerCount: 0, averageScore: null };
  }

  const scoreTotal = rankedEntries.reduce((total, entry) => total + entry.best_score, 0);
  return { playerCount, averageScore: scoreTotal / playerCount };
}

function findViewerEntry(
  rankedEntries: LeaderboardEntry[],
  viewerUserId: string | null,
): LeaderboardEntry | null {
  if (viewerUserId === null) return null;
  return rankedEntries.find((entry) => entry.user_id === viewerUserId) ?? null;
}

export function buildLeaderboardResponse(
  scenarioId: string,
  rankedEntries: LeaderboardEntry[],
  viewerUserId: string | null,
): LeaderboardResponse {
  return {
    scenarioId,
    stats: computeStats(rankedEntries),
    entries: rankedEntries.slice(0, LEADERBOARD_TOP_N),
    viewerEntry: findViewerEntry(rankedEntries, viewerUserId),
  };
}
