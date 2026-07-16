import { getScenarioLeaderboard } from "@/lib/server/db";
import "@testing-library/jest-dom";
import { createClient } from "../../src/utils/supabase/server";

// jest.mock must use a relative path here: the SWC transform rewrites `@/`
// aliases in import statements but not in jest.mock() strings, so an aliased
// mock target fails to resolve.
jest.mock("../../src/utils/supabase/server", () => ({
  createClient: jest.fn(),
}));

interface QueryResult {
  data: unknown;
  error: unknown;
}

function mockLeaderboardQuery(result: QueryResult) {
  const builder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };
  const supabase = { from: jest.fn().mockReturnValue(builder) };
  (createClient as jest.Mock).mockResolvedValue(supabase);
  return { builder, supabase };
}

describe("getScenarioLeaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("queries the leaderboard view filtered by scenario", async () => {
    const { builder, supabase } = mockLeaderboardQuery({ data: [], error: null });

    await getScenarioLeaderboard("scenario-1");

    expect(supabase.from).toHaveBeenCalledWith("scenario_leaderboard");
    expect(builder.select).toHaveBeenCalledWith(
      "user_id, display_name, best_score, attempt_count, best_score_at"
    );
    expect(builder.eq).toHaveBeenCalledWith("scenario_id", "scenario-1");
    expect(builder.order).toHaveBeenCalledWith("best_score", { ascending: false });
    expect(builder.order).toHaveBeenCalledWith("best_score_at", { ascending: true });
    expect(builder.limit).toHaveBeenCalledWith(500);
  });

  it("returns entries ranked contiguously from the view order", async () => {
    mockLeaderboardQuery({
      data: [
        { user_id: "a", display_name: "Ann", best_score: 5, attempt_count: 2, best_score_at: "2026-07-15T00:00:00Z" },
        { user_id: "b", display_name: "Bob", best_score: 4, attempt_count: 1, best_score_at: "2026-07-15T00:01:00Z" },
      ],
      error: null,
    });

    const entries = await getScenarioLeaderboard("scenario-1");

    expect(entries).toEqual([
      { user_id: "a", display_name: "Ann", best_score: 5, attempt_count: 2, best_score_at: "2026-07-15T00:00:00Z", rank: 1 },
      { user_id: "b", display_name: "Bob", best_score: 4, attempt_count: 1, best_score_at: "2026-07-15T00:01:00Z", rank: 2 },
    ]);
  });

  it("throws a DatabaseError when the query fails", async () => {
    mockLeaderboardQuery({ data: null, error: { message: "boom", code: "500" } });
    console.error = jest.fn();

    await expect(getScenarioLeaderboard("scenario-1")).rejects.toThrow();
  });
});
