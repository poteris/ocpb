-- Persist generated feedback so the leaderboard can rank best scores.
-- Ported from develop (20250915000000/20250915000001) minus RLS: this branch
-- uses the service-role client and application-level scoping throughout.
-- Created in both schemas because this deployment selects its schema at
-- runtime via SUPABASE_SCHEMA (public locally, labour_party in production).

CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL UNIQUE REFERENCES public.conversations(conversation_id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  areas_for_improvement JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_conversation_id ON public.feedback(conversation_id);

CREATE TABLE labour_party.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL UNIQUE REFERENCES labour_party.conversations(conversation_id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  areas_for_improvement JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_labour_feedback_conversation_id ON labour_party.feedback(conversation_id);

GRANT ALL ON public.feedback TO anon, authenticated, service_role;
GRANT ALL ON labour_party.feedback TO anon, authenticated, service_role;
