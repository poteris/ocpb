-- Enforce one display name per participant, case-insensitively. Two rows named
-- "Sam" and "sam" are the same person to anyone reading the leaderboard, so
-- uniqueness is on lower(display_name).

-- Existing rows may already collide (the app never enforced this). Deterministically
-- suffix the later duplicates ("Sam", "Sam (2)", "Sam (3)", ...) ordered by creation
-- so no current leaderboard entry silently disappears when the index is created.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(display_name)
      ORDER BY created_at ASC, id ASC
    ) AS duplicate_rank
  FROM public.users
)
UPDATE public.users AS u
SET
  display_name = u.display_name || ' (' || ranked.duplicate_rank || ')',
  updated_at = CURRENT_TIMESTAMP
FROM ranked
WHERE u.id = ranked.id
  AND ranked.duplicate_rank > 1;

CREATE UNIQUE INDEX users_display_name_unique
  ON public.users (lower(display_name));

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(display_name)
      ORDER BY created_at ASC, id ASC
    ) AS duplicate_rank
  FROM labour_party.users
)
UPDATE labour_party.users AS u
SET
  display_name = u.display_name || ' (' || ranked.duplicate_rank || ')',
  updated_at = CURRENT_TIMESTAMP
FROM ranked
WHERE u.id = ranked.id
  AND ranked.duplicate_rank > 1;

CREATE UNIQUE INDEX labour_users_display_name_unique
  ON labour_party.users (lower(display_name));
