import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  created_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['notes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (n: { title: string; content: string; subject: string }) => {
      const { error } = await supabase.from('notes').insert({
        user_id: user!.id,
        title: n.title,
        content: n.content,
        subject: n.subject,
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
