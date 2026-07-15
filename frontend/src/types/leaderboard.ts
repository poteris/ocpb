import { z } from "zod";

export const leaderboardRowSchema = z.object({
  user_id: z.string(),
  display_name: z.string(),
  best_score: z.number().int().min(1).max(5),
  attempt_count: z.number().int().min(1),
  best_score_at: z.string(),
});

export type LeaderboardRow = z.infer<typeof leaderboardRowSchema>;

export const leaderboardEntrySchema = leaderboardRowSchema.extend({
  rank: z.number().int().min(1),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const LEADERBOARD_TOP_N = 10;

export const leaderboardStatsSchema = z.object({
  playerCount: z.number().int().min(0),
  averageScore: z.number().min(1).max(5).nullable(),
});

export type LeaderboardStats = z.infer<typeof leaderboardStatsSchema>;

export const leaderboardResponseSchema = z.object({
  scenarioId: z.string(),
  stats: leaderboardStatsSchema,
  entries: z.array(leaderboardEntrySchema).max(LEADERBOARD_TOP_N),
  viewerEntry: leaderboardEntrySchema.nullable(),
});

export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
