import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, X, BookOpen, Pencil } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAssignments, Assignment } from '@/hooks/useAssignments';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function Assignments() {
  const { assignments, isLoading, add, toggle, remove, edit, isAdding, isEditing } = useAssignments();
  const { isAdmin } = useIsAdmin();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    await add({ title: title.trim(), subject: subject.trim() || 'General', deadline: deadline || null });
    setTitle(''); setSubject(''); setDeadline('');
    setShowForm(false);
  };

  const startEdit = (a: Assignment) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditSubject(a.subject);
    setEditDeadline(a.deadline || '');
  };

  const handleEdit = async () => {
    if (!editingId || !editTitle.trim()) return;
    await edit({ id: editingId, title: editTitle.trim(), subject: editSubject.trim() || 'General', deadline: editDeadline || null });
    setEditingId(null);
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <GlassCard hover={false} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">New Assignment</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="rounded-xl bg-muted/50" />
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="rounded-xl bg-muted/50" />
                <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="rounded-xl bg-muted/50" />
              </div>
              <Button variant="gradient" onClick={handleAdd} disabled={isAdding || !title.trim()} className="rounded-xl">
                {isAdding ? <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> : 'Save'}
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover={false} className="flex items-center gap-4">
                <button onClick={() => toggle({ id: a.id, completed: !a.completed })} className="shrink-0">
                  {a.completed
                    ? <CheckCircle className="h-5 w-5 text-success" />
                    : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />}
                </button>

                {editingId === a.id ? (
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" className="rounded-xl bg-muted/50 h-8 text-sm" />
                      <Input value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Subject" className="rounded-xl bg-muted/50 h-8 text-sm" />
                      <Input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} className="rounded-xl bg-muted/50 h-8 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="gradient" size="sm" onClick={handleEdit} disabled={isEditing || !editTitle.trim()} className="rounded-xl h-7 text-xs">
                        {isEditing ? <div className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" /> : 'Save'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="rounded-xl h-7 text-xs">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-foreground ${a.completed ? 'line-through opacity-50' : ''}`}>{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{a.subject}</span>
                      {a.deadline && <span className="text-xs text-muted-foreground">{a.deadline}</span>}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  {isAdmin && editingId !== a.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => startEdit(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => remove(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {assignments.length === 0 && (
            <GlassCard hover={false} className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No assignments yet. Add your first one!</p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
