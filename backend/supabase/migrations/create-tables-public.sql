-- Drop existing tables
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.feedback_prompts;
DROP TABLE IF EXISTS public.persona_prompts;
DROP TABLE IF EXISTS public.scenario_prompts;
DROP TABLE IF EXISTS public.scenario_objectives;
DROP TABLE IF EXISTS public.personas;
DROP TABLE IF EXISTS public.scenarios;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scenarios table
CREATE TABLE scenarios (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scenario objectives table
CREATE TABLE scenario_objectives (
    id SERIAL PRIMARY KEY,
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
    emotional_conditions_for_supporting_the_union TEXT NOT NULL,
    busyness_level VARCHAR(50) NOT NULL,
    workplace VARCHAR(255) NOT NULL
);

-- Scenario prompts table
CREATE TABLE scenario_prompts (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- Persona prompts table
CREATE TABLE persona_prompts (
    id SERIAL PRIMARY KEY,
    persona_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (persona_id) REFERENCES personas(id)
);

-- Feedback prompts table
CREATE TABLE feedback_prompts (
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
  feedback_prompt_id INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id),
  FOREIGN KEY (persona_id) REFERENCES personas(id),
  FOREIGN KEY (feedback_prompt_id) REFERENCES feedback_prompts(id)
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
ALTER TABLE public.feedback_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own conversations" ON public.conversations
  FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Allow read access to authenticated users for feedback_prompts" 
    ON public.feedback_prompts FOR SELECT 
    TO authenticated 
    USING (true);

-- Grant access to tables for authenticated users
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT SELECT ON public.feedback_prompts TO authenticated;
