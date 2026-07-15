import { buildLeaderboardResponse } from "@/lib/server/leaderboard";
import { LEADERBOARD_TOP_N, LeaderboardEntry } from "@/types/leaderboard";

function makeEntry(rank: number, bestScore: number, userId: string): LeaderboardEntry {
  return {
    user_id: userId,
    display_name: `Player ${rank}`,
    best_score: bestScore,
    attempt_count: 1,
    best_score_at: `2026-07-15T00:00:${String(rank).padStart(2, "0")}Z`,
    rank,
  };
}

function makeRankedEntries(count: number, bestScore = 5): LeaderboardEntry[] {
  return Array.from({ length: count }, (_, index) => makeEntry(index + 1, bestScore, `user-${index + 1}`));
}

describe("buildLeaderboardResponse", () => {
  it("returns zeroed stats and null viewer entry for an empty board", () => {
    const response = buildLeaderboardResponse("scenario-1", [], null);

    expect(response).toEqual({
      scenarioId: "scenario-1",
      stats: { playerCount: 0, averageScore: null },
      entries: [],
      viewerEntry: null,
    });
  });

  it("averages the best scores across all players", () => {
    const entries = [
      makeEntry(1, 5, "user-1"),
      makeEntry(2, 4, "user-2"),
      makeEntry(3, 3, "user-3"),
    ];

    const response = buildLeaderboardResponse("scenario-1", entries, null);

    expect(response.stats.playerCount).toBe(3);
    expect(response.stats.averageScore).toBe(4);
  });

  it("counts every player but returns only the top ten entries", () => {
    const entries = makeRankedEntries(12);

    const response = buildLeaderboardResponse("scenario-1", entries, null);

    expect(response.stats.playerCount).toBe(12);
    expect(response.entries).toHaveLength(LEADERBOARD_TOP_N);
    expect(response.entries[0].user_id).toBe("user-1");
  });

  it("returns the viewer entry when it is inside the top ten", () => {
    const entries = makeRankedEntries(12);

    const response = buildLeaderboardResponse("scenario-1", entries, "user-3");

    expect(response.viewerEntry?.user_id).toBe("user-3");
    expect(response.viewerEntry?.rank).toBe(3);
  });

  it("returns the viewer entry with its true rank when it is outside the top ten", () => {
    const entries = makeRankedEntries(12);

    const response = buildLeaderboardResponse("scenario-1", entries, "user-11");

    expect(response.entries.some((entry) => entry.user_id === "user-11")).toBe(false);
    expect(response.viewerEntry?.rank).toBe(11);
  });

  it("returns a null viewer entry for an unknown user id", () => {
    const entries = makeRankedEntries(3);

    const response = buildLeaderboardResponse("scenario-1", entries, "not-a-player");

    expect(response.viewerEntry).toBeNull();
  });
});
