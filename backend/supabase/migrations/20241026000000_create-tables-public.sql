-- Drop existing tables
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.feedback_prompts;
DROP TABLE IF EXISTS public.scenario_prompts;
DROP TABLE IF EXISTS public.scenario_objectives;
DROP TABLE IF EXISTS public.personas;
DROP TABLE IF EXISTS public.scenarios;
DROP TABLE IF EXISTS public.system_prompts;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scenarios table
CREATE TABLE scenarios (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    context TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenario objectives table
CREATE TABLE scenario_objectives (
    id TEXT PRIMARY KEY,
    scenario_id VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- Personas table
CREATE TABLE personas (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    segment VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(50) NOT NULL,
    family_status VARCHAR(255) NOT NULL,
    job VARCHAR(255) NOT NULL,
    major_issues_in_workplace TEXT NOT NULL,
    uk_party_affiliation VARCHAR(255) NOT NULL,
    personality_traits TEXT NOT NULL,
    emotional_conditions TEXT NOT NULL,
    busyness_level VARCHAR(50) NOT NULL,
    workplace VARCHAR(255) NOT NULL
);

-- Scenario prompts table
CREATE TABLE system_prompts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback prompts table
CREATE TABLE feedback_prompts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add persona prompts table
CREATE TABLE persona_prompts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  scenario_id VARCHAR(255) NOT NULL,
  persona_id VARCHAR(255) NOT NULL,
  system_prompt_id INTEGER NOT NULL DEFAULT 1,
  feedback_prompt_id INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
  FOREIGN KEY (persona_id) REFERENCES personas(id),
  FOREIGN KEY (feedback_prompt_id) REFERENCES feedback_prompts(id),
  FOREIGN KEY (system_prompt_id) REFERENCES system_prompts(id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id)
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own conversations" ON public.conversations
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Grant access to tables for authenticated users
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.feedback_prompts TO authenticated;
GRANT ALL ON public.scenarios TO authenticated;
GRANT ALL ON public.scenario_objectives TO authenticated;
GRANT ALL ON public.persona_prompts TO authenticated;

-- Update grants for sequences
GRANT USAGE ON SEQUENCE feedback_prompts_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE persona_prompts_id_seq TO authenticated;
