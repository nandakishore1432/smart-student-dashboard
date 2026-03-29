
-- Assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  deadline DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON public.assignments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assignments" ON public.assignments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assignments" ON public.assignments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Lost & Found table
CREATE TABLE public.lost_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'lost',
  contact TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lost_found" ON public.lost_found FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own lost_found" ON public.lost_found FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own lost_found" ON public.lost_found FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
