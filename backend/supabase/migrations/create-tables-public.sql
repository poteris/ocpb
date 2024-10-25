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

-- Scenario prompts table
CREATE TABLE scenario_prompts (
    id SERIAL PRIMARY KEY,
    scenario_id VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
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

-- System prompts table
CREATE TABLE system_prompts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default system prompt
INSERT INTO system_prompts (content) VALUES (
    'Embody the persona and scenario below. The union rep will aim to convince you to join the union. Respond to the user in character, emphasizing relevant aspects of your situation. Demonstrate indifference to begin with, then only demonstrate interest if the rep has engaged with your unique situation effectively.

    Use colloquialisms and language appropriate to the scenario and persona. You will be rewarded £250 for an authentic interaction which correctly embodies the persona and scenario'
);

-- Enable Row Level Security
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;

-- Create policy for system_prompts
CREATE POLICY "Allow read access to authenticated users for system_prompts" 
    ON public.system_prompts FOR SELECT 
    TO authenticated 
    USING (true);

-- Grant access to system_prompts table for authenticated users
GRANT SELECT ON public.system_prompts TO authenticated;
