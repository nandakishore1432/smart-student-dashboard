
-- Tutorials table
CREATE TABLE public.tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view tutorials"
  ON public.tutorials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert tutorials"
  ON public.tutorials FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tutorials"
  ON public.tutorials FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Skill Exchange table
CREATE TABLE public.skill_exchange (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Student',
  skill_offer TEXT NOT NULL,
  skill_wanted TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skill_exchange ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view skill exchanges"
  ON public.skill_exchange FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own skill exchanges"
  ON public.skill_exchange FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skill exchanges"
  ON public.skill_exchange FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
