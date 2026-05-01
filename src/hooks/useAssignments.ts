import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cacheKey, readCache, writeCache } from '@/lib/offlineCache';

export type Priority = 'low' | 'medium' | 'high';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string | null;
  completed: boolean;
  priority: Priority;
  created_at: string;
}

export function useAssignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const ckey = cacheKey('assignments', user?.id);

  const query = useQuery({
    queryKey: ['assignments', user?.id],
    enabled: !!user,
    initialData: () => readCache<Assignment[]>(ckey) ?? undefined,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        const list = (data ?? []) as Assignment[];
        writeCache(ckey, list);
        return list;
      } catch (err) {
        // Network drop / fetch failure → fall back to cached snapshot
        const cached = readCache<Assignment[]>(ckey);
        if (cached) return cached;
        throw err;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry forever when fully offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
      return failureCount < 2;
    },
  });

  const assertOnline = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error("You're offline — changes will be available once you reconnect.");
    }
  };

  const addMutation = useMutation({
    mutationFn: async (a: { title: string; subject: string; deadline: string | null; priority?: Priority }) => {
      assertOnline();
      const { error } = await supabase.from('assignments').insert({
        user_id: user!.id,
        title: a.title,
        subject: a.subject,
        deadline: a.deadline || null,
        priority: a.priority || 'medium',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Assignment added!' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      assertOnline();
      const { error } = await supabase.from('assignments').update({ completed }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['assignments'] }),
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Assignment deleted' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const editMutation = useMutation({
    mutationFn: async (a: { id: string; title: string; subject: string; deadline: string | null; priority?: Priority }) => {
      const { error } = await supabase
        .from('assignments')
        .update({ title: a.title, subject: a.subject, deadline: a.deadline || null, priority: a.priority || 'medium' })
        .eq('id', a.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Assignment updated!' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  return {
    assignments: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation.mutateAsync,
    toggle: toggleMutation.mutate,
    remove: deleteMutation.mutate,
    edit: editMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
  };
}
