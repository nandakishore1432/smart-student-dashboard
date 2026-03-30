import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  user_id: string;
  display_name: string;
  content: string;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const displayName = user?.email?.split('@')[0] || 'Student';

  const query = useQuery({
    queryKey: ['chat_messages'],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data as ChatMessage[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        qc.invalidateQueries({ queryKey: ['chat_messages'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, qc]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from('chat_messages').insert({
        user_id: user!.id,
        display_name: displayName,
        content,
      });
      if (error) throw error;
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    send: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}
