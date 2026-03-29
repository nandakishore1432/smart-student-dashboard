import { motion } from 'framer-motion';
import { BookOpen, Clock, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split('@')[0] || 'Student';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting}, <span className="gradient-text capitalize">{name}</span> 👋
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your studies today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assignments" value={12} icon={BookOpen} color="primary" delay={0.1} />
        <StatCard title="Pending Tasks" value={5} icon={Clock} color="warning" trend="-2 from yesterday" delay={0.2} />
        <StatCard title="Completed" value={7} icon={CheckCircle} color="success" trend="+3 this week" delay={0.3} />
        <StatCard title="Notifications" value={3} icon={Bell} color="accent" delay={0.4} />
      </div>

      {/* Quick Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard delay={0.5} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">📅 Upcoming Deadlines</h3>
          <div className="space-y-3">
            {[
              { subject: 'Math Assignment', due: 'Tomorrow', urgent: true },
              { subject: 'Physics Lab Report', due: 'In 3 days', urgent: false },
              { subject: 'English Essay', due: 'Next Week', urgent: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm font-medium text-foreground">{item.subject}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${item.urgent ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                  {item.due}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.6} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">📢 Recent Announcements</h3>
          <div className="space-y-3">
            {[
              { title: 'Exam Schedule Released', time: '2h ago' },
              { title: 'Library Hours Extended', time: '5h ago' },
              { title: 'New Course Materials Available', time: '1d ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
