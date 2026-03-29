import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

export function useAnnouncements() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['announcements'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  return {
    announcements: query.data ?? [],
    isLoading: query.isLoading,
  };
}
