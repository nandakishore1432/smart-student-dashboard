import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SkillPost {
  id: string;
  user_id: string;
  display_name: string;
  skill_offer: string;
  skill_wanted: string;
  contact: string;
  created_at: string;
}

export function useSkillExchange() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['skill-exchange'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skill_exchange')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SkillPost[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (p: { skill_offer: string; skill_wanted: string; contact: string }) => {
      const { error } = await supabase.from('skill_exchange').insert({
        user_id: user!.id,
        display_name: user?.email?.split('@')[0] || 'Student',
        skill_offer: p.skill_offer,
        skill_wanted: p.skill_wanted,
        contact: p.contact,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skill-exchange'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('skill_exchange').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skill-exchange'] }),
  });

  return {
    posts,
    isLoading,
    add: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
}
