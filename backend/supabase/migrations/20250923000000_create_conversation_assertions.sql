-- Create conversation assertions table
CREATE TABLE conversation_assertions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id TEXT NOT NULL,
    assertion_name VARCHAR(255) NOT NULL,
    passed BOOLEAN NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES public.conversations(conversation_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_conversation_assertions_conversation_id ON conversation_assertions(conversation_id);
CREATE INDEX idx_conversation_assertions_assertion_name ON conversation_assertions(assertion_name);
CREATE INDEX idx_conversation_assertions_passed ON conversation_assertions(passed);

-- Add composite index for filtering by failed assertions
CREATE INDEX idx_conversation_assertions_failed ON conversation_assertions(conversation_id, assertion_name) WHERE passed = false;
