import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  created_by: string | null;
  created_at: string;
}

export function useTutorials() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['tutorials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Tutorial[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (t: { title: string; description: string; category: string }) => {
      const { error } = await supabase.from('tutorials').insert({
        title: t.title,
        description: t.description,
        category: t.category,
        created_by: user?.email?.split('@')[0] || 'Admin',
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutorials'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tutorials').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutorials'] }),
  });

  return {
    tutorials,
    isLoading,
    add: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
}
