-- Lightweight participant identity for the scenario leaderboard.
-- No auth: the id is a uuid minted client-side and persisted in localStorage.
-- This deployment is single-tenant per schema (SUPABASE_SCHEMA), so unlike the
-- develop branch there is no organisations table and no organisation_id column.

CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_scenario_id ON public.conversations(scenario_id);

CREATE TABLE labour_party.users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_labour_conversations_user_id ON labour_party.conversations(user_id);
CREATE INDEX idx_labour_conversations_scenario_id ON labour_party.conversations(scenario_id);

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
  sa.user_id,
  u.display_name,
  sa.score AS best_score,
  sa.attempt_count::int AS attempt_count,
  sa.created_at AS best_score_at
FROM scored_attempts sa
JOIN public.users u ON u.id = sa.user_id
WHERE sa.row_rank = 1;

CREATE OR REPLACE VIEW labour_party.scenario_leaderboard AS
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
  FROM labour_party.feedback f
  JOIN labour_party.conversations c ON c.conversation_id = f.conversation_id
)
SELECT
  sa.scenario_id,
  sa.user_id,
  u.display_name,
  sa.score AS best_score,
  sa.attempt_count::int AS attempt_count,
  sa.created_at AS best_score_at
FROM scored_attempts sa
JOIN labour_party.users u ON u.id = sa.user_id
WHERE sa.row_rank = 1;

GRANT ALL ON public.users TO anon, authenticated, service_role;
GRANT ALL ON labour_party.users TO anon, authenticated, service_role;
GRANT SELECT ON public.scenario_leaderboard TO anon, authenticated, service_role;
GRANT SELECT ON labour_party.scenario_leaderboard TO anon, authenticated, service_role;
