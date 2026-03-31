import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/GlassCard';
import { TrendingUp, Zap, Brain } from 'lucide-react';
import type { Assignment } from '@/hooks/useAssignments';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(263, 70%, 58%)'];

export function CompletionChart({ assignments }: { assignments: Assignment[] }) {
  const completed = assignments.filter(a => a.completed).length;
  const pending = assignments.filter(a => !a.completed).length;
  const data = [
    { name: 'Completed', value: completed },
    { name: 'Pending', value: pending },
  ];
  const pct = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;

  return (
    <GlassCard delay={0.7} className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" /> Completion Rate
      </h3>
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Zap className="h-10 w-10 text-primary/30 mb-2" />
          <p className="text-sm text-muted-foreground">No assignments yet</p>
          <p className="text-xs text-muted-foreground/60">Start adding tasks to track progress!</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 flex-1">
            <p className="text-3xl font-bold text-foreground">{pct}%</p>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{completed} of {assignments.length} done</p>
            <div className="flex gap-3">
              {data.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export function WeeklyChart({ assignments }: { assignments: Assignment[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const data = days.map((name, i) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(startOfWeek.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = assignments.filter(a => {
      const d = new Date(a.created_at);
      return d >= dayStart && d < dayEnd;
    }).length;

    return { name, tasks: count };
  });

  const hasActivity = data.some(d => d.tasks > 0);

  return (
    <GlassCard delay={0.8} className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Zap className="h-5 w-5 text-warning" /> Weekly Activity
      </h3>
      {!hasActivity && assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Zap className="h-10 w-10 text-warning/30 mb-2" />
          <p className="text-sm text-muted-foreground">No activity this week</p>
          <p className="text-xs text-muted-foreground/60">Add assignments to see your weekly stats.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
            />
            <Bar dataKey="tasks" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}

export function ProductivityInsight({ assignments }: { assignments: Assignment[] }) {
  const total = assignments.length;
  const completed = assignments.filter(a => a.completed).length;
  const pending = total - completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let level: string;
  let color: string;
  let message: string;

  if (total === 0) {
    level = 'Getting Started 🚀';
    color = 'text-muted-foreground';
    message = 'Start adding tasks to track your productivity!';
  } else if (pct >= 80) {
    level = 'Outstanding! 🏆';
    color = 'text-success';
    message = "Amazing work — you're crushing it!";
  } else if (pct >= 60) {
    level = 'Great Progress! 🚀';
    color = 'text-primary';
    message = 'Almost there — keep the momentum!';
  } else if (pending > completed && total > 2) {
    level = 'Heads Up! ⚠️';
    color = 'text-warning';
    message = `You have ${pending} pending tasks. Try to finish at least one today!`;
  } else {
    level = 'Keep Going! 💪';
    color = 'text-muted-foreground';
    message = 'Every completed task counts — stay consistent!';
  }

  return (
    <GlassCard delay={0.9} className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Brain className="h-5 w-5 text-accent" /> Smart Insight
      </h3>
      <div className="space-y-3">
        <p className={`text-lg font-bold ${color}`}>{level}</p>
        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {total > 0 && (
            <>You've completed <span className="font-semibold text-foreground">{pct}%</span> of your assignments. </>
          )}
          {message}
        </p>
      </div>
    </GlassCard>
  );
}
