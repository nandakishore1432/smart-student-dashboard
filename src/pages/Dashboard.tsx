import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Bell, CheckCircle, Plus, X, Sparkles, ListTodo, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { CompletionChart, WeeklyChart, ProductivityInsight } from '@/components/DashboardCharts';
import { useAssignments, Priority } from '@/hooks/useAssignments';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const { user } = useAuth();
  const { assignments, isLoading: aLoading, add, isAdding } = useAssignments();
  const { announcements, isLoading: nLoading } = useAnnouncements();
  const name = user?.email?.split('@')[0] || 'Student';

  const [fabOpen, setFabOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const pending = assignments.filter(a => !a.completed);
  const completed = assignments.filter(a => a.completed);
  const upcoming = pending
    .filter(a => a.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  const isLoading = aLoading || nLoading;

  const handleQuickAdd = async () => {
    if (!title.trim()) return;
    await add({ title: title.trim(), subject: subject.trim() || 'General', deadline: deadline || null, priority });
    setTitle(''); setSubject(''); setDeadline(''); setPriority('medium');
    setFabOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting}, <span className="gradient-text capitalize">{name}</span> 👋
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total" value={assignments.length} icon={BookOpen} color="primary" delay={0.1} />
        <StatCard title="Pending" value={pending.length} icon={Clock} color="warning" delay={0.2} />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle} color="success" delay={0.3} />
        <StatCard title="Notices" value={announcements.length} icon={Bell} color="accent" delay={0.4} />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </>
        ) : (
          <>
            <CompletionChart assignments={assignments} />
            <WeeklyChart assignments={assignments} />
            <ProductivityInsight assignments={assignments} />
          </>
        )}
      </div>

      {/* Deadlines & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard lines={5} />
            <SkeletonCard lines={5} />
          </>
        ) : (
          <>
            <GlassCard delay={1.0} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                {upcoming.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <Sparkles className="h-10 w-10 text-primary/40 mb-3" />
                    </motion.div>
                    <p className="text-sm font-medium text-muted-foreground">No upcoming deadlines 🎉</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">You're all clear — enjoy your day!</p>
                  </div>
                ) : upcoming.map(a => (
                  <motion.div
                    key={a.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted/70"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">{a.title}</span>
                      <span className="text-xs text-muted-foreground">{a.subject}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${
                      (() => {
                        const d = new Date(a.deadline! + 'T23:59:59');
                        const diff = d.getTime() - Date.now();
                        if (diff < 0) return 'bg-destructive/15 text-destructive';
                        if (diff <= 24 * 60 * 60 * 1000) return 'bg-warning/15 text-warning animate-pulse';
                        return 'bg-primary/10 text-primary';
                      })()
                    }`}>
                      {a.deadline}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={1.1} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" /> Recent Announcements
              </h3>
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <ListTodo className="h-10 w-10 text-accent/40 mb-3" />
                    </motion.div>
                    <p className="text-sm font-medium text-muted-foreground">No announcements yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Check back later for updates.</p>
                  </div>
                ) : announcements.slice(0, 3).map(a => (
                  <motion.div
                    key={a.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted/70"
                  >
                    <span className="text-sm font-medium text-foreground truncate">{a.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setFabOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-primary shadow-glow flex items-center justify-center text-primary-foreground"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Quick Add Dialog */}
      <Dialog open={fabOpen} onOpenChange={setFabOpen}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Assignment</DialogTitle>
            <DialogDescription>Add a new task right from the dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Assignment title *" value={title} onChange={e => setTitle(e.target.value)} />
            <Input placeholder="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} />
            <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔴 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleQuickAdd}
              disabled={isAdding || !title.trim()}
              className="w-full"
              variant="gradient"
            >
              {isAdding ? 'Adding…' : 'Add Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
