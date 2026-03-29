import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  completed: boolean;
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', title: 'Calculus Problem Set', subject: 'Mathematics', deadline: '2026-04-02', completed: false },
    { id: '2', title: 'Lab Report', subject: 'Physics', deadline: '2026-04-05', completed: false },
    { id: '3', title: 'Essay Draft', subject: 'English', deadline: '2026-04-10', completed: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const { toast } = useToast();

  const addAssignment = () => {
    if (!title.trim() || !subject.trim() || !deadline) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setAssignments(prev => [...prev, {
      id: Date.now().toString(),
      title: title.trim(),
      subject: subject.trim(),
      deadline,
      completed: false,
    }]);
    setTitle(''); setSubject(''); setDeadline('');
    setShowForm(false);
    toast({ title: 'Assignment added!' });
  };

  const toggle = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const remove = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Assignment removed' });
  };

  const pending = assignments.filter(a => !a.completed);
  const completed = assignments.filter(a => a.completed);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground text-sm">{pending.length} pending · {completed.length} completed</p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard hover={false} className="space-y-4">
              <h3 className="font-semibold text-foreground">New Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="rounded-xl bg-muted/50" />
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="rounded-xl bg-muted/50" />
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="rounded-xl bg-muted/50" />
              </div>
              <div className="flex gap-2">
                <Button variant="gradient" onClick={addAssignment} className="rounded-xl">Save</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {assignments.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard hover={false} className="flex items-center gap-4 p-4">
              <button onClick={() => toggle(a.id)} className="shrink-0 transition-colors">
                {a.completed
                  ? <CheckCircle className="h-6 w-6 text-success" />
                  : <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${a.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground">{a.subject}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                  <Calendar className="h-3 w-3" /> {a.deadline}
                </span>
                <Button variant="ghost" size="icon" onClick={() => remove(a.id)} className="rounded-xl text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
