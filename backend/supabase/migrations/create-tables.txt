-- Create a private schema
CREATE SCHEMA IF NOT EXISTS private;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant usage on private schema to authenticated users
GRANT USAGE ON SCHEMA private TO authenticated;

-- Assistants table
CREATE TABLE private.assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threads table
CREATE TABLE private.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,  -- Changed from UUID to TEXT
  assistant_id UUID NOT NULL REFERENCES private.assistants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE private.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT UNIQUE NOT NULL,
  thread_id UUID NOT NULL REFERENCES private.threads(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE private.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own threads" ON private.threads
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can only access messages in their threads" ON private.messages
  FOR ALL USING (auth.uid()::text = (SELECT user_id::text FROM private.threads WHERE id::text = thread_id::text));

-- Grant access to tables for authenticated users
GRANT ALL ON private.assistants TO authenticated;
GRANT ALL ON private.threads TO authenticated;
GRANT ALL ON private.messages TO authenticated;
