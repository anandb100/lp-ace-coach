-- Drop foreign key constraints to allow anonymous usage with dummy user ID
-- RLS policies will continue to control access

-- Drop foreign key constraint from documents table
ALTER TABLE public.documents
DROP CONSTRAINT IF EXISTS documents_user_id_fkey;

-- Drop foreign key constraint from interview_sessions table
ALTER TABLE public.interview_sessions
DROP CONSTRAINT IF EXISTS interview_sessions_user_id_fkey;

-- Drop foreign key constraint from interview_responses table
ALTER TABLE public.interview_responses
DROP CONSTRAINT IF EXISTS interview_responses_user_id_fkey;

-- Add comments explaining the design decision
COMMENT ON COLUMN public.documents.user_id IS 'User ID - no FK constraint to support anonymous usage with dummy UUID. Access controlled via RLS policies.';
COMMENT ON COLUMN public.interview_sessions.user_id IS 'User ID - no FK constraint to support anonymous usage with dummy UUID. Access controlled via RLS policies.';
COMMENT ON COLUMN public.interview_responses.user_id IS 'User ID - no FK constraint to support anonymous usage with dummy UUID. Access controlled via RLS policies.';