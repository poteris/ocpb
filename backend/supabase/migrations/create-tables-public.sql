-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assistants table
CREATE TABLE public.assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threads table
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,  -- Changed from UUID to TEXT
  assistant_id UUID NOT NULL REFERENCES public.assistants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT UNIQUE NOT NULL,
  thread_id UUID NOT NULL REFERENCES public.threads(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own threads" ON public.threads
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can only access messages in their threads" ON public.messages
  FOR ALL USING (auth.uid()::text = (SELECT user_id::text FROM public.threads WHERE id::text = thread_id::text));

-- Grant access to tables for authenticated users
GRANT ALL ON public.assistants TO authenticated;
GRANT ALL ON public.threads TO authenticated;
GRANT ALL ON public.messages TO authenticated;
