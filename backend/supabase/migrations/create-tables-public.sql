-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scenarios table
CREATE TABLE scenarios (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- Scenario objectives table
CREATE TABLE scenario_objectives (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
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

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  persona_id TEXT NOT NULL,
  system_prompt_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL REFERENCES public.conversations(conversation_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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