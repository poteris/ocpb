"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/Select";
import { Button } from "@/components/ui/button";
import { TrainingScenario } from "@/types/scenarios";
import {
  LEADERBOARD_TOP_N,
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardStats,
  leaderboardResponseSchema,
} from "@/types/leaderboard";
import { getStoredParticipantId } from "@/lib/participant";

const POLL_INTERVAL_MS = 5000;

const EMPTY_STATS: LeaderboardStats = { playerCount: 0, averageScore: null };

const formatAverageScore = (score: number | null): string => {
  if (score === null) return "–";
  return `${score.toFixed(1)}/5`;
};

const getScoreBadge = (score: number): string => {
  if (score >= 4) return "bg-green-100 text-green-800";
  if (score >= 3) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const getRankColor = (rank: number): string => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-amber-700";
  return "text-gray-300";
};

async function fetchScenarios(): Promise<TrainingScenario[]> {
  try {
    const response = await axios.get<TrainingScenario[]>("/api/scenarios");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    return [];
  }
}

async function fetchLeaderboard(scenarioId: string, participantId: string | null): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({ scenarioId });
  if (participantId !== null) params.set("userId", participantId);
  const response = await axios.get(`/api/leaderboard?${params.toString()}`);
  return leaderboardResponseSchema.parse(response.data);
}

interface LeaderboardProps {
  scenarioId: string | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ scenarioId }) => {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    setParticipantId(getStoredParticipantId());
    fetchScenarios().then(setScenarios);
  }, []);

  const loadLeaderboard = useCallback(async () => {
    if (!scenarioId) return;
    try {
      setBoard(await fetchLeaderboard(scenarioId, participantId));
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [scenarioId, participantId]);

  useEffect(() => {
    if (!scenarioId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadLeaderboard();
    const intervalId = setInterval(loadLeaderboard, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [scenarioId, loadLeaderboard]);

  const handleScenarioChange = (nextScenarioId: string) => {
    router.replace(`/leaderboard?scenarioId=${nextScenarioId}`);
  };

  const selectedScenario = scenarios.find((scenario) => scenario.id === scenarioId);
  const entries = board?.entries ?? [];
  const stats = board?.stats ?? EMPTY_STATS;
  const viewerEntry = board?.viewerEntry ?? null;
  const hasOwnEntry = viewerEntry !== null;
  const isViewerInTopN =
    viewerEntry !== null && entries.some((entry) => entry.user_id === viewerEntry.user_id);

  const renderEntryRow = (entry: LeaderboardEntry) => {
    const isCurrentUser = participantId !== null && entry.user_id === participantId;
    return (
      <tr
        key={entry.user_id}
        data-testid="leaderboardRow"
        data-user-id={entry.user_id}
        className={`border-b ${isCurrentUser ? "bg-primary-light" : "hover:bg-gray-50"}`}
      >
        <td className="px-4 py-4">
          <span className={`text-xl font-bold ${getRankColor(entry.rank)}`}>
            {entry.rank <= 3 ? <Trophy size={22} className={getRankColor(entry.rank)} /> : entry.rank}
          </span>
        </td>
        <td className="px-4 py-4 text-lg font-medium text-gray-900" data-testid="leaderboardName">
          {entry.display_name}
          {isCurrentUser && (
            <Badge className="ml-2 bg-primary text-white text-xs rounded-full" data-testid="leaderboardYouBadge">You</Badge>
          )}
        </td>
        <td className="px-4 py-4 text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreBadge(entry.best_score)}`} data-testid="leaderboardScore">
            {entry.best_score}/5
          </span>
        </td>
        <td className="px-4 py-4 text-center text-gray-600" data-testid="leaderboardAttempts">
          {entry.attempt_count}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-100 min-h-[calc(100vh-85px)]">
      <div className="container mx-auto px-6 md:px-8 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Leaderboard
            </h1>
            {selectedScenario && (
              <p className="text-lg text-gray-600 mt-1">{selectedScenario.title}</p>
            )}
            {scenarioId && !isLoading && (
              <Button
                className="mt-3"
                onClick={() => router.push(`/scenario-setup?scenarioId=${scenarioId}`)}
                data-testid="improveScoreButton"
              >
                {hasOwnEntry ? "Improve your score" : "Play this scenario"}
              </Button>
            )}
          </div>

          <div className="w-full sm:w-72">
            <Select value={scenarioId ?? undefined} onValueChange={handleScenarioChange}>
              <SelectTrigger data-testid="leaderboardScenarioSelect">
                {selectedScenario ? selectedScenario.title : "Select a scenario"}
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!scenarioId ? (
          <Card className="p-12 text-center text-gray-500" data-testid="leaderboardNoScenarioState">
            Select a scenario to see its leaderboard.
          </Card>
        ) : isLoading ? (
          <Card className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-4 md:p-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Players</p>
                <p className="text-3xl font-light text-gray-900 mt-1" data-testid="leaderboardPlayerCount">
                  {stats.playerCount}
                </p>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Average score</p>
                <p className="text-3xl font-light text-gray-900 mt-1" data-testid="leaderboardAverageScore">
                  {formatAverageScore(stats.averageScore)}
                </p>
              </Card>
            </div>

            {entries.length === 0 ? (
              <Card className="p-12 text-center text-gray-500" data-testid="leaderboardEmptyState">
                No scores yet — finish a conversation to appear here.
              </Card>
            ) : (
              <Card className="p-4 md:p-6">
                <h2
                  className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4"
                  data-testid="leaderboardTopTenHeading"
                >
                  Top {LEADERBOARD_TOP_N}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full" data-testid="leaderboardTable">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-20">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Best Score
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Attempts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(renderEntryRow)}
                      {viewerEntry !== null && !isViewerInTopN && (
                        <>
                          <tr data-testid="leaderboardViewerRowDivider">
                            <td className="px-4 py-2 text-center text-gray-300" colSpan={4}>
                              …
                            </td>
                          </tr>
                          {renderEntryRow(viewerEntry)}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
