import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Phone, X, Search } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Item {
  id: string;
  title: string;
  description: string;
  type: 'lost' | 'found';
  contact: string;
  location: string;
  date: string;
}

export default function LostFound() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', title: 'Blue Backpack', description: 'Navy blue backpack with laptop compartment. Has a keychain attached.', type: 'lost', contact: 'john@uni.edu', location: 'Library 2nd Floor', date: '2026-03-28' },
    { id: '2', title: 'Student ID Card', description: 'Found a student ID card near the cafeteria entrance.', type: 'found', contact: 'jane@uni.edu', location: 'Cafeteria', date: '2026-03-27' },
    { id: '3', title: 'Wireless Earbuds', description: 'White wireless earbuds in a charging case, found on bench.', type: 'found', contact: 'mike@uni.edu', location: 'Main Courtyard', date: '2026-03-26' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [form, setForm] = useState({ title: '', description: '', type: 'lost' as 'lost' | 'found', contact: '', location: '' });
  const { toast } = useToast();

  const addItem = () => {
    if (!form.title.trim() || !form.description.trim() || !form.contact.trim()) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    setItems(prev => [{ ...form, id: Date.now().toString(), title: form.title.trim(), description: form.description.trim(), contact: form.contact.trim(), location: form.location.trim(), date: new Date().toISOString().split('T')[0] }, ...prev]);
    setForm({ title: '', description: '', type: 'lost', contact: '', location: '' });
    setShowForm(false);
    toast({ title: 'Item posted!' });
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Lost & Found</h1>
          <p className="text-muted-foreground text-sm">{items.length} items posted</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Post Item
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'lost', 'found'] as const).map(t => (
          <Button
            key={t}
            variant={filter === t ? 'default' : 'glass'}
            onClick={() => setFilter(t)}
            className="rounded-xl capitalize"
            size="sm"
          >
            {t === 'all' ? 'All Items' : t}
          </Button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard hover={false} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Report Item</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="flex gap-2">
                {(['lost', 'found'] as const).map(t => (
                  <Button key={t} variant={form.type === t ? 'default' : 'glass'} onClick={() => setForm(p => ({ ...p, type: t }))} className="rounded-xl capitalize" size="sm">
                    {t}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Item name" className="rounded-xl bg-muted/50" />
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Location" className="rounded-xl bg-muted/50" />
              </div>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description..." className="rounded-xl bg-muted/50" />
              <Input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="Contact email" className="rounded-xl bg-muted/50" />
              <Button variant="gradient" onClick={addItem} className="rounded-xl">Post</Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard hover={false} className="flex items-start gap-4">
              <div className={`rounded-xl p-3 shrink-0 ${item.type === 'lost' ? 'bg-destructive/10' : 'bg-success/10'}`}>
                <Search className={`h-5 w-5 ${item.type === 'lost' ? 'text-destructive' : 'text-success'}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.type === 'lost' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{item.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.contact}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
