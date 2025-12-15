-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL UNIQUE REFERENCES public.conversations(conversation_id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  summary TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  areas_for_improvement JSONB NOT NULL DEFAULT '[]'::jsonb,
  human_rating VARCHAR(20), -- For admin evaluation: 'good', 'bad', etc.
  human_notes TEXT, -- For qualitative admin feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read feedback
CREATE POLICY "Users can read feedback for their conversations" ON public.feedback
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversations 
      WHERE user_id = auth.uid()::text
    )
  );

-- Grant access to authenticated users
GRANT SELECT ON public.feedback TO authenticated;
GRANT INSERT ON public.feedback TO authenticated;
GRANT UPDATE ON public.feedback TO authenticated;

-- Create index for performance
CREATE INDEX idx_feedback_conversation_id ON public.feedback(conversation_id);
