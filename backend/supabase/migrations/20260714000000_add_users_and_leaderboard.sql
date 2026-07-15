-- Lightweight participant identity for the scenario leaderboard.
-- No auth: the id is a uuid minted client-side and persisted in localStorage.
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  organisation_id VARCHAR(255) NOT NULL DEFAULT 'default' REFERENCES public.organisations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_scenario_id ON public.conversations(scenario_id);

-- One row per (scenario, user): their best score, attempt count, and when the
-- best score was first achieved (the tie-break). Joining users inner-excludes
-- legacy conversations that used throwaway per-conversation ids.
CREATE OR REPLACE VIEW public.scenario_leaderboard AS
WITH scored_attempts AS (
  SELECT
    c.scenario_id,
    c.user_id,
    f.score,
    f.created_at,
    COUNT(*) OVER (PARTITION BY c.scenario_id, c.user_id) AS attempt_count,
    ROW_NUMBER() OVER (
      PARTITION BY c.scenario_id, c.user_id
      ORDER BY f.score DESC, f.created_at ASC
    ) AS row_rank
  FROM public.feedback f
  JOIN public.conversations c ON c.conversation_id = f.conversation_id
)
SELECT
  sa.scenario_id,
  s.organisation_id,
  sa.user_id,
  u.display_name,
  sa.score AS best_score,
  sa.attempt_count::int AS attempt_count,
  sa.created_at AS best_score_at
FROM scored_attempts sa
JOIN public.users u ON u.id = sa.user_id
JOIN public.scenarios s ON s.id = sa.scenario_id
WHERE sa.row_rank = 1;
