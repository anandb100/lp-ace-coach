-- Enable RLS on leadership_principles table and create policy for public read access
ALTER TABLE public.leadership_principles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read leadership principles (public reference data)
CREATE POLICY "Leadership principles are publicly readable"
ON public.leadership_principles
FOR SELECT
USING (true);