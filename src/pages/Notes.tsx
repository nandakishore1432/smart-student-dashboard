import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Trash2, X } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
}

const colors = [
  'from-primary/20 to-primary/5',
  'from-accent/20 to-accent/5',
  'from-success/20 to-success/5',
  'from-warning/20 to-warning/5',
  'from-info/20 to-info/5',
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Quantum Mechanics Basics', content: 'Wave-particle duality, Heisenberg uncertainty principle...', subject: 'Physics', createdAt: '2026-03-28' },
    { id: '2', title: 'Integration Techniques', content: 'Substitution, integration by parts, partial fractions...', subject: 'Math', createdAt: '2026-03-27' },
    { id: '3', title: 'Shakespeare Analysis', content: 'Themes of power and ambition in Macbeth...', subject: 'English', createdAt: '2026-03-26' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const { toast } = useToast();

  const addNote = () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content required', variant: 'destructive' });
      return;
    }
    setNotes(prev => [{ id: Date.now().toString(), title: title.trim(), content: content.trim(), subject: subject.trim() || 'General', createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
    setTitle(''); setContent(''); setSubject('');
    setShowForm(false);
    toast({ title: 'Note saved!' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground text-sm">{notes.length} notes saved</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard hover={false} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">New Note</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" className="rounded-xl bg-muted/50" />
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="rounded-xl bg-muted/50" />
              </div>
              <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your notes..." className="rounded-xl bg-muted/50 min-h-[120px]" />
              <Button variant="gradient" onClick={addNote} className="rounded-xl">Save Note</Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, i) => (
          <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className={`space-y-3 bg-gradient-to-br ${colors[i % colors.length]}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{note.subject}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => {
                  setNotes(prev => prev.filter(n => n.id !== note.id));
                  toast({ title: 'Note deleted' });
                }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <h3 className="font-semibold text-foreground">{note.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
              <p className="text-xs text-muted-foreground">{note.createdAt}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
