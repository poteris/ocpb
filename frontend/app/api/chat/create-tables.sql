-- Assistants table
CREATE TABLE assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assistant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threads table
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  assistant_id UUID NOT NULL REFERENCES assistants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT UNIQUE NOT NULL,
  thread_id UUID NOT NULL REFERENCES threads(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);