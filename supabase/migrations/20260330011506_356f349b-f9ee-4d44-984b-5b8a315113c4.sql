-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT '',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view chat" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Storage bucket for note attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('note-files', 'note-files', true);

CREATE POLICY "Authenticated users can upload note files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'note-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view note files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'note-files');

CREATE POLICY "Users can delete own note files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'note-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add file columns to notes
ALTER TABLE public.notes ADD COLUMN file_url text DEFAULT NULL;
ALTER TABLE public.notes ADD COLUMN file_name text DEFAULT NULL;