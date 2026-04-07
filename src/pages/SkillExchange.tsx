import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, ArrowRightLeft, Sparkles, Mail } from 'lucide-react';
import { useSkillExchange } from '@/hooks/useSkillExchange';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function SkillExchange() {
  const { posts, isLoading, add, isAdding, remove } = useSkillExchange();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [skillOffer, setSkillOffer] = useState('');
  const [skillWanted, setSkillWanted] = useState('');
  const [contact, setContact] = useState('');

  const handleAdd = async () => {
    if (!skillOffer.trim() || !skillWanted.trim()) return;
    await add({ skill_offer: skillOffer.trim(), skill_wanted: skillWanted.trim(), contact: contact.trim() });
    setSkillOffer(''); setSkillWanted(''); setContact('');
    setOpen(false);
    toast({ title: 'Skill post added!' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" /> Skill Exchange
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Teach what you know, learn what you need.</p>
        </div>
        <Button variant="gradient" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Post Skill
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <GlassCard hover={false} className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-12 w-12 text-accent/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No skill posts yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Be the first to share your skills!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground capitalize">{p.display_name}</span>
                    {user?.id === p.user_id && (
                      <button
                        onClick={() => remove(p.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-xl bg-success/10 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-success font-semibold mb-1">Can Teach</p>
                      <p className="text-sm font-medium text-foreground">{p.skill_offer}</p>
                    </div>
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 rounded-xl bg-primary/10 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Wants to Learn</p>
                      <p className="text-sm font-medium text-foreground">{p.skill_wanted}</p>
                    </div>
                  </div>
                  {p.contact && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {p.contact}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post a Skill Exchange</DialogTitle>
            <DialogDescription>Share what you can teach and what you want to learn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Skill you can teach *" value={skillOffer} onChange={e => setSkillOffer(e.target.value)} />
            <Input placeholder="Skill you want to learn *" value={skillWanted} onChange={e => setSkillWanted(e.target.value)} />
            <Input placeholder="Contact info (optional)" value={contact} onChange={e => setContact(e.target.value)} />
            <Button onClick={handleAdd} disabled={isAdding || !skillOffer.trim() || !skillWanted.trim()} className="w-full" variant="gradient">
              {isAdding ? 'Posting…' : 'Post Skill'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
