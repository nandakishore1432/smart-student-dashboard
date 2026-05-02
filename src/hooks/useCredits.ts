import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  kind: string;
  reason: string | null;
  reference_id: string | null;
  created_at: string;
};

export type UserCredits = {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  last_daily_grant: string | null;
};

export function useCredits() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ['credits', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<UserCredits | null> => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('user_id,balance,lifetime_earned,last_daily_grant')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserCredits | null;
    },
  });

  const txQuery = useQuery({
    queryKey: ['credit-transactions', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CreditTransaction[]> => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as CreditTransaction[];
    },
  });

  // Auto-claim daily login credits once per session per day.
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `daily-credits-claimed:${user.id}:${today}`;
    if (localStorage.getItem(cacheKey)) return;
    (async () => {
      const { error } = await supabase.rpc('claim_daily_credits');
      localStorage.setItem(cacheKey, '1');
      if (!error) {
        qc.invalidateQueries({ queryKey: ['credits', user.id] });
        qc.invalidateQueries({ queryKey: ['credit-transactions', user.id] });
      }
    })();
  }, [user, qc]);

  const redeem = useMutation({
    mutationFn: async (rewardId: string) => {
      const { data, error } = await supabase.rpc('redeem_reward', { _reward_id: rewardId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credits', user?.id] });
      qc.invalidateQueries({ queryKey: ['credit-transactions', user?.id] });
      qc.invalidateQueries({ queryKey: ['rewards'] });
      qc.invalidateQueries({ queryKey: ['my-redemptions', user?.id] });
      toast({ title: '🎉 Reward redeemed!', description: 'Check your redemption history.' });
    },
    onError: (e: any) => {
      toast({ title: 'Redemption failed', description: e.message ?? 'Try again', variant: 'destructive' });
    },
  });

  return {
    balance: balanceQuery.data?.balance ?? 0,
    lifetimeEarned: balanceQuery.data?.lifetime_earned ?? 0,
    transactions: txQuery.data ?? [],
    isLoading: balanceQuery.isLoading,
    redeem: redeem.mutate,
    redeeming: redeem.isPending,
  };
}

export type Reward = {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  stock: number | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export function useRewards(includeInactive = false) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['rewards', includeInactive],
    queryFn: async (): Promise<Reward[]> => {
      let q = supabase.from('rewards').select('*').order('cost', { ascending: true });
      if (!includeInactive) q = q.eq('active', true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Reward[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (input: Partial<Reward> & { id?: string }) => {
      if (input.id) {
        const { error } = await supabase.from('rewards').update(input).eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rewards').insert([input as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards'] });
      toast({ title: 'Reward saved' });
    },
    onError: (e: any) => toast({ title: 'Save failed', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rewards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards'] });
      toast({ title: 'Reward deleted' });
    },
    onError: (e: any) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
  });

  return { rewards: query.data ?? [], isLoading: query.isLoading, upsert: upsert.mutate, remove: remove.mutate };
}

export type Redemption = {
  id: string;
  user_id: string;
  reward_id: string;
  cost_at_purchase: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  created_at: string;
};

export function useMyRedemptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-redemptions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*, rewards(title, image_url)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
