import { motion } from 'framer-motion';
import { Coins, Gift, Package, History, CheckCircle2, Clock } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCredits, useRewards, useMyRedemptions } from '@/hooks/useCredits';

const KIND_LABELS: Record<string, string> = {
  signup_bonus: 'Welcome bonus',
  daily_login: 'Daily login',
  task_completed: 'Task completed',
  admin_grant: 'Admin grant',
  redemption: 'Redeemed',
  purchase: 'Purchased',
  adjustment: 'Adjustment',
};

export default function Rewards() {
  const { balance, lifetimeEarned, transactions, redeem, redeeming } = useCredits();
  const { rewards, isLoading } = useRewards();
  const { data: redemptions } = useMyRedemptions();

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-1">
      {/* Header / balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 gradient-primary text-primary-foreground shadow-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p className="text-sm uppercase tracking-wider opacity-80">Your credit balance</p>
          <div className="flex items-end gap-2 mt-1">
            <Coins className="h-9 w-9" />
            <span className="text-5xl font-extrabold tabular-nums">{balance}</span>
          </div>
          <p className="text-xs mt-1 opacity-80">Lifetime earned: {lifetimeEarned}</p>
        </div>
        <div className="text-xs opacity-90 max-w-xs">
          Earn credits by completing assignments (+10), daily logins (+5), and admin grants. Spend on rewards below.
        </div>
      </motion.div>

      <Tabs defaultValue="rewards">
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="rewards"><Gift className="h-4 w-4 mr-1" />Catalog</TabsTrigger>
          <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" />My Orders</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="mt-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading rewards…</p>
          ) : rewards.length === 0 ? (
            <GlassCard hover={false}>
              <p className="text-center text-muted-foreground py-8">No rewards available yet. Check back soon!</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((r, i) => {
                const outOfStock = r.stock !== null && r.stock <= 0;
                const cantAfford = balance < r.cost;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard hover className="h-full flex flex-col">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="h-32 w-full object-cover rounded-xl mb-3" />
                      ) : (
                        <div className="h-32 w-full rounded-xl mb-3 gradient-primary flex items-center justify-center">
                          <Gift className="h-12 w-12 text-primary-foreground opacity-80" />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-foreground">{r.title}</h3>
                        <Badge variant="secondary" className="shrink-0">{r.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{r.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 font-bold text-primary">
                          <Coins className="h-4 w-4" />
                          <span className="tabular-nums">{r.cost}</span>
                        </div>
                        {r.stock !== null && (
                          <span className="text-xs text-muted-foreground">{r.stock} left</span>
                        )}
                      </div>
                      <Button
                        variant="gradient"
                        className="mt-3 rounded-xl"
                        disabled={outOfStock || cantAfford || redeeming}
                        onClick={() => redeem(r.id)}
                      >
                        {outOfStock ? 'Out of stock' : cantAfford ? `Need ${r.cost - balance} more` : 'Redeem'}
                      </Button>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <GlassCard hover={false}>
            {(!redemptions || redemptions.length === 0) ? (
              <p className="text-center text-muted-foreground py-8">No redemptions yet.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {redemptions.map((r: any) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {r.rewards?.image_url ? (
                        <img src={r.rewards.image_url} alt="" className="h-10 w-10 object-cover rounded-lg" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                          <Gift className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{r.rewards?.title ?? 'Reward'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary tabular-nums">-{r.cost_at_purchase}</span>
                      {r.status === 'fulfilled' ? (
                        <Badge className="bg-success/20 text-success"><CheckCircle2 className="h-3 w-3 mr-1" />Fulfilled</Badge>
                      ) : r.status === 'cancelled' ? (
                        <Badge variant="destructive">Cancelled</Badge>
                      ) : (
                        <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <GlassCard hover={false}>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No credit activity yet.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {transactions.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{KIND_LABELS[t.kind] ?? t.kind}</p>
                      {t.reason && <p className="text-xs text-muted-foreground">{t.reason}</p>}
                      <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`font-bold tabular-nums ${t.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {t.amount >= 0 ? '+' : ''}{t.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
