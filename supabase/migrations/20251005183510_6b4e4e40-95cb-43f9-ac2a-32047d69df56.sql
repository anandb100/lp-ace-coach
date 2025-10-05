-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.interview_sessions;

DROP POLICY IF EXISTS "Users can view own responses" ON public.interview_responses;
DROP POLICY IF EXISTS "Users can create own responses" ON public.interview_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON public.interview_responses;

-- Create new policies for documents table that support dummy user ID
CREATE POLICY "Allow anonymous and authenticated document access"
ON public.documents
FOR ALL
USING (
  user_id = '00000000-0000-0000-0000-000000000000'::uuid 
  OR auth.uid() = user_id
)
WITH CHECK (
  user_id = '00000000-0000-0000-0000-000000000000'::uuid 
  OR auth.uid() = user_id
);

-- Create new policies for interview_sessions table that support dummy user ID
CREATE POLICY "Allow anonymous and authenticated session access"
ON public.interview_sessions
FOR ALL
USING (
  user_id = '00000000-0000-0000-0000-000000000000'::uuid 
  OR auth.uid() = user_id
)
WITH CHECK (
  user_id = '00000000-0000-0000-0000-000000000000'::uuid 
  OR auth.uid() = user_id
);

-- Create new policies for interview_responses table that support dummy user ID
CREATE POLICY "Allow anonymous and authenticated response access"
ON public.interview_responses
FOR ALL
USING (
  user_id = '00000000-0000-0000-0000-000000000000'::uuid 
  OR auth.uid() = user_id
)
WITH CHECK (
  user_id = '00000000-0000-0000-0000-000000000000'::uuid 
  OR auth.uid() = user_id
);