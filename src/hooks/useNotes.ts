import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cacheKey, readCache, writeCache } from '@/lib/offlineCache';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const ckey = cacheKey('notes', user?.id);

  const assertOnline = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error("You're offline — changes will be available once you reconnect.");
    }
  };

  const query = useQuery({
    queryKey: ['notes', user?.id],
    enabled: !!user,
    initialData: () => readCache<Note[]>(ckey) ?? undefined,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const list = (data ?? []) as Note[];
        writeCache(ckey, list);
        return list;
      } catch (err) {
        const cached = readCache<Note[]>(ckey);
        if (cached) return cached;
        throw err;
      }
    },
    retry: (failureCount) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
      return failureCount < 2;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (n: { title: string; content: string; subject: string; file_url?: string | null; file_name?: string | null }) => {
      assertOnline();
      const { error } = await supabase.from('notes').insert({
        user_id: user!.id,
        title: n.title,
        content: n.content,
        subject: n.subject,
        file_url: n.file_url || null,
        file_name: n.file_name || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Note saved!' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      assertOnline();
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: 'Note deleted' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation.mutateAsync,
    remove: deleteMutation.mutate,
    isAdding: addMutation.isPending,
  };
}
