import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  type: string;
  contact: string;
  location: string;
  created_at: string;
  user_id: string;
}

export function useLostFound() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['lost-found'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lost_found')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LostFoundItem[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (item: { title: string; description: string; type: string; contact: string; location: string }) => {
      const { error } = await supabase.from('lost_found').insert({
        user_id: user!.id,
        ...item,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] });
      toast({ title: 'Item posted!' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lost_found').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lost-found'] });
      toast({ title: 'Item removed' });
    },
    onError: (e: Error) => toast({ title: e.message, variant: 'destructive' }),
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation.mutateAsync,
    remove: deleteMutation.mutate,
    isAdding: addMutation.isPending,
  };
}
