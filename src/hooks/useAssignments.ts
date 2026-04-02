import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  const query = useQuery({
    queryKey: ['assignments', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Assignment[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (a: { title: string; subject: string; deadline: string | null; priority?: Priority }) => {
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
    mutationFn: async (a: { id: string; title: string; subject: string; deadline: string | null }) => {
      const { error } = await supabase
        .from('assignments')
        .update({ title: a.title, subject: a.subject, deadline: a.deadline || null })
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
