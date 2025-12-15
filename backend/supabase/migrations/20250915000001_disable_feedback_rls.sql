-- Disable Row Level Security on feedback table
-- Since we're using service role key and don't have real user auth,
-- RLS policies are not needed for this table
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- Drop the existing policies since they're no longer needed
DROP POLICY IF EXISTS "Users can read feedback for their conversations" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert feedback for their conversations" ON public.feedback;
DROP POLICY IF EXISTS "Users can update feedback for their conversations" ON public.feedback;
