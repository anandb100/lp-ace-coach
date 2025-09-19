-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create documents table for storing uploaded files
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('resume', 'job_description')),
  filename TEXT NOT NULL,
  file_url TEXT,
  content TEXT, -- Extracted text content
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Users can view own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT,
  company TEXT DEFAULT 'Amazon',
  selected_principles JSONB, -- Array of selected leadership principles with relevance scores
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_question_index INTEGER DEFAULT 0,
  total_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on interview sessions
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for interview sessions
CREATE POLICY "Users can view own sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create interview responses table
CREATE TABLE public.interview_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  leadership_principle TEXT NOT NULL,
  question_text TEXT NOT NULL,
  audio_url TEXT, -- URL to stored audio recording
  transcribed_text TEXT,
  star_analysis JSONB, -- Analysis of Situation, Task, Action, Result
  scores JSONB, -- Individual metric scores
  overall_score INTEGER,
  feedback TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on interview responses
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for interview responses
CREATE POLICY "Users can view own responses" 
ON public.interview_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own responses" 
ON public.interview_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses" 
ON public.interview_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create leadership principles reference table (public data)
CREATE TABLE public.leadership_principles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  key_behaviors TEXT[] NOT NULL
);

-- Insert Amazon's 16 Leadership Principles
INSERT INTO public.leadership_principles (id, title, description, key_behaviors) VALUES
('customer-obsession', 'Customer Obsession', 'Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust.', ARRAY['Customer-first thinking', 'Data-driven decisions', 'Long-term relationship building']),
('ownership', 'Ownership', 'Leaders are owners. They think long term and don''t sacrifice long-term value for short-term results.', ARRAY['Taking responsibility', 'Long-term thinking', 'Acting on behalf of the company']),
('invent-simplify', 'Invent and Simplify', 'Leaders expect and require innovation and invention from their teams and always find ways to simplify.', ARRAY['Creative problem solving', 'Process optimization', 'Innovation mindset']),
('right-a-lot', 'Are Right, A Lot', 'Leaders are right a lot. They have strong judgment and good instincts.', ARRAY['Sound judgment', 'Data analysis', 'Decision making']),
('learn-curious', 'Learn and Be Curious', 'Leaders are never done learning and always seek to improve themselves.', ARRAY['Continuous learning', 'Seeking feedback', 'Knowledge sharing']),
('hire-develop', 'Hire and Develop the Best', 'Leaders raise the performance bar with every hire and promotion.', ARRAY['Talent identification', 'Team development', 'Performance standards']),
('insist-highest', 'Insist on the Highest Standards', 'Leaders have relentlessly high standards.', ARRAY['Quality focus', 'Attention to detail', 'Excellence pursuit']),
('think-big', 'Think Big', 'Thinking small is a self-fulfilling prophecy.', ARRAY['Visionary thinking', 'Bold ideas', 'Strategic planning']),
('bias-for-action', 'Bias for Action', 'Speed matters in business. Many decisions are reversible.', ARRAY['Quick decision making', 'Calculated risk taking', 'Execution focus']),
('frugality', 'Frugality', 'Accomplish more with less. Constraints breed resourcefulness.', ARRAY['Resource optimization', 'Cost consciousness', 'Creative solutions']),
('earn-trust', 'Earn Trust', 'Leaders listen attentively, speak candidly, and treat others respectfully.', ARRAY['Honest communication', 'Reliability', 'Respect for others']),
('dive-deep', 'Dive Deep', 'Leaders operate at all levels, stay connected to the details.', ARRAY['Attention to detail', 'Root cause analysis', 'Hands-on approach']),
('have-backbone', 'Have Backbone; Disagree and Commit', 'Leaders are obligated to respectfully challenge decisions.', ARRAY['Constructive disagreement', 'Commitment to decisions', 'Principled stands']),
('deliver-results', 'Deliver Results', 'Leaders focus on the key inputs and deliver them with the right quality.', ARRAY['Results orientation', 'Performance tracking', 'Goal achievement']),
('strive-best', 'Strive to be Earth''s Best Employer', 'Leaders work every day to create a safer, more productive work environment.', ARRAY['Employee development', 'Workplace safety', 'Inclusive culture']),
('success-scale', 'Success and Scale Bring Broad Responsibility', 'We started in a garage, but we''re not there anymore.', ARRAY['Social responsibility', 'Ethical decision making', 'Community impact']);

-- Make leadership principles readable by everyone (no RLS needed for reference data)
-- No RLS policies needed as this is public reference data

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();