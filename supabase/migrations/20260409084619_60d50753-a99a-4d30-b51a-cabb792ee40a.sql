
-- 1. Fix profiles SELECT policy: restrict to owner or admin
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 2. Add trigger to enforce display_name on chat_messages from profiles
CREATE OR REPLACE FUNCTION public.set_chat_display_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.display_name := COALESCE(
    (SELECT display_name FROM public.profiles WHERE user_id = NEW.user_id),
    SPLIT_PART((SELECT email FROM auth.users WHERE id = NEW.user_id), '@', 1),
    'Student'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_chat_display_name
BEFORE INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.set_chat_display_name();

-- 3. Make note-files bucket private
UPDATE storage.buckets SET public = false WHERE id = 'note-files';

-- 4. Add missing UPDATE policy for note-files storage
CREATE POLICY "Users can update own note files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Add SELECT policy scoped to owner for note-files (now private)
CREATE POLICY "Users can view own note files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);
