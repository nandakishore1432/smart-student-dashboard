import { useState } from 'react';
import { Plus, Trash2, Edit2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GlassCard } from '@/components/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useRewards, type Reward } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

function RewardForm({ initial, onSave, onClose }: { initial?: Reward; onSave: (r: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'Education',
    cost: initial?.cost ?? 50,
    stock: initial?.stock ?? null,
    image_url: initial?.image_url ?? '',
    active: initial?.active ?? true,
  });

  return (
    <div className="space-y-3">
      <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Education / Entertainment" /></div>
        <div><Label>Cost (credits)</Label><Input type="number" min={1} value={form.cost} onChange={e => setForm({ ...form, cost: parseInt(e.target.value) || 0 })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Stock (blank = unlimited)</Label>
          <Input type="number" min={0} value={form.stock ?? ''} onChange={e => setForm({ ...form, stock: e.target.value === '' ? null : parseInt(e.target.value) })} />
        </div>
        <div className="flex items-end gap-2 pb-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Active</Label></div>
      </div>
      <div><Label>Image URL (optional)</Label><Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="gradient" onClick={() => { onSave({ ...(initial && { id: initial.id }), ...form }); onClose(); }}>
          {initial ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </div>
  );
}

function GrantCreditsDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const grant = async () => {
    setBusy(true);
    try {
      const { data: profile, error: pe } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email.trim())
        .maybeSingle();
      if (pe || !profile) throw new Error('User not found by email');
      const { error } = await supabase.rpc('award_credits', {
        _user_id: profile.user_id,
        _amount: amount,
        _kind: 'admin_grant',
        _reason: reason || 'Manual grant',
        _reference_id: null,
      });
      if (error) throw error;
      toast({ title: 'Credits granted', description: `+${amount} to ${email}` });
      setOpen(false); setEmail(''); setAmount(10); setReason('');
    } catch (e: any) {
      toast({ title: 'Grant failed', description: e.message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline"><Coins className="h-4 w-4 mr-2" />Grant credits</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Grant credits to a student</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Student email</Label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" /></div>
          <div><Label>Amount (use negative to deduct)</Label><Input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} /></div>
          <div><Label>Reason</Label><Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Bonus for excellent project" /></div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={grant} disabled={busy || !email}>Grant</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminRewards() {
  const { rewards, upsert, remove } = useRewards(true);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rewards & Credits</h1>
          <p className="text-sm text-muted-foreground">Manage the rewards catalog and grant credits to students.</p>
        </div>
        <div className="flex gap-2">
          <GrantCreditsDialog />
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild><Button variant="gradient"><Plus className="h-4 w-4 mr-2" />New reward</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create reward</DialogTitle></DialogHeader>
              <RewardForm onSave={upsert} onClose={() => setCreating(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rewards.map(r => (
          <GlassCard key={r.id} hover={false}>
            <div className="flex items-start gap-3">
              {r.image_url ? (
                <img src={r.image_url} alt="" className="h-16 w-16 object-cover rounded-lg" />
              ) : (
                <div className="h-16 w-16 rounded-lg gradient-primary" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold truncate">{r.title}</h3>
                  {!r.active && <span className="text-xs px-2 rounded bg-muted">Inactive</span>}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-primary font-bold">{r.cost} credits</span>
                  <span className="text-muted-foreground">{r.category}</span>
                  <span className="text-muted-foreground">Stock: {r.stock ?? '∞'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="ghost" size="sm" onClick={() => setEditing(r)}><Edit2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this reward?')) remove(r.id); }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit reward</DialogTitle></DialogHeader>
          {editing && <RewardForm initial={editing} onSave={upsert} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
