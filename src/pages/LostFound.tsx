import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Phone, Trash2, X, Search } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLostFound } from '@/hooks/useLostFound';
import { useAuth } from '@/contexts/AuthContext';

export default function LostFound() {
  const { user } = useAuth();
  const { items, isLoading, add, remove, isAdding } = useLostFound();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [form, setForm] = useState({ title: '', description: '', type: 'lost', contact: '', location: '' });

  const handleAdd = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    await add({ ...form, title: form.title.trim(), description: form.description.trim() });
    setForm({ title: '', description: '', type: 'lost', contact: '', location: '' });
    setShowForm(false);
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Lost & Found</h1>
          <p className="text-muted-foreground text-sm">{items.length} items posted</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Post Item
        </Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'lost', 'found'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'gradient' : 'ghost'}
            size="sm"
            className="rounded-xl capitalize"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </Button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard hover={false} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Report an Item</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="flex gap-2">
                {(['lost', 'found'] as const).map(t => (
                  <Button key={t} variant={form.type === t ? 'gradient' : 'ghost'} size="sm" className="rounded-xl capitalize" onClick={() => setForm(f => ({ ...f, type: t }))}>
                    {t === 'lost' ? '🔴 Lost' : '🟢 Found'}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Item name" className="rounded-xl bg-muted/50" />
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="rounded-xl bg-muted/50" />
              </div>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" className="rounded-xl bg-muted/50" />
              <Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact info" className="rounded-xl bg-muted/50" />
              <Button variant="gradient" onClick={handleAdd} disabled={isAdding || !form.title.trim()} className="rounded-xl">
                {isAdding ? <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> : 'Post Item'}
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <GlassCard hover={false} className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No items found.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover={false} className={`border-l-4 ${item.type === 'lost' ? 'border-l-destructive' : 'border-l-success'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${item.type === 'lost' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                        {item.type.toUpperCase()}
                      </span>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                      {item.contact && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.contact}</span>}
                    </div>
                  </div>
                  {item.user_id === user?.id && (
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
