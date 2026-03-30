import { motion } from 'framer-motion';
import { BookOpen, Clock, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { CompletionChart, WeeklyChart, ProductivityInsight } from '@/components/DashboardCharts';
import { useAssignments } from '@/hooks/useAssignments';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { assignments, isLoading: aLoading } = useAssignments();
  const { announcements, isLoading: nLoading } = useAnnouncements();
  const name = user?.email?.split('@')[0] || 'Student';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const pending = assignments.filter(a => !a.completed);
  const completed = assignments.filter(a => a.completed);
  const upcoming = pending
    .filter(a => a.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  const isLoading = aLoading || nLoading;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting}, <span className="gradient-text capitalize">{name}</span> 👋
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
      </motion.div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard lines={5} />
            <SkeletonCard lines={5} />
          </>
        ) : (
          <>
            <GlassCard delay={1.0} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">📅 Upcoming Deadlines</h3>
              <div className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming deadlines 🎉</p>
                ) : upcoming.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground block truncate">{a.title}</span>
                      <span className="text-xs text-muted-foreground">{a.subject}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary shrink-0">
                      {a.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard delay={1.1} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">📢 Recent Announcements</h3>
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                ) : announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <span className="text-sm font-medium text-foreground truncate">{a.title}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
