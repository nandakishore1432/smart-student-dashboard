import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, Tag, Sparkles } from 'lucide-react';
import { useTutorials } from '@/hooks/useTutorials';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Coding', 'Exams', 'Projects', 'Research', 'Design', 'General'];

const CATEGORY_COLORS: Record<string, string> = {
  Coding: 'bg-primary/20 text-primary',
  Exams: 'bg-destructive/20 text-destructive',
  Projects: 'bg-warning/20 text-warning',
  Research: 'bg-accent/20 text-accent',
  Design: 'bg-success/20 text-success',
  General: 'bg-muted text-muted-foreground',
};

export default function Tutorials() {
  const { tutorials, isLoading, add, isAdding, remove } = useTutorials();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? tutorials : tutorials.filter(t => t.category === filter);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await add({ title: title.trim(), description: description.trim(), category });
    setTitle(''); setDescription(''); setCategory('General');
    setOpen(false);
    toast({ title: 'Tutorial added!' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Tutorial Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Browse learning resources curated for students.</p>
        </div>
        {isAdmin && (
          <Button variant="gradient" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Tutorial
          </Button>
        )}
      </motion.div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {['All', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === c ? 'gradient-primary text-primary-foreground shadow-glow' : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tutorials grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard hover={false} className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-12 w-12 text-primary/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No tutorials yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {isAdmin ? 'Click "Add Tutorial" to get started!' : 'Check back later for new content.'}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="space-y-3 relative group">
                  <div className="flex items-start justify-between">
                    <Badge className={`${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.General} border-0`}>
                      <Tag className="h-3 w-3 mr-1" /> {t.category}
                    </Badge>
                    {isAdmin && (
                      <button
                        onClick={() => remove(t.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{t.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
                  {t.created_by && (
                    <p className="text-xs text-muted-foreground/50">By {t.created_by}</p>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tutorial</DialogTitle>
            <DialogDescription>Create a new learning resource for students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Tutorial title *" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={isAdding || !title.trim()} className="w-full" variant="gradient">
              {isAdding ? 'Adding…' : 'Add Tutorial'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
