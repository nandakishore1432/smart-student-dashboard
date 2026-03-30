import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/GlassCard';
import type { Assignment } from '@/hooks/useAssignments';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(263, 70%, 58%)', 'hsl(142, 71%, 45%)'];

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
      <h3 className="text-lg font-semibold text-foreground">📈 Completion Rate</h3>
      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No assignments yet</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">{pct}%</p>
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

  return (
    <GlassCard delay={0.8} className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">📊 Weekly Activity</h3>
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
    </GlassCard>
  );
}

export function ProductivityInsight({ assignments }: { assignments: Assignment[] }) {
  const total = assignments.length;
  const completed = assignments.filter(a => a.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  let level = 'Getting Started 🌱';
  let color = 'text-muted-foreground';
  if (pct >= 80) { level = 'Outstanding! 🏆'; color = 'text-success'; }
  else if (pct >= 60) { level = 'Great Progress! 🚀'; color = 'text-primary'; }
  else if (pct >= 40) { level = 'Keep Going! 💪'; color = 'text-warning'; }

  return (
    <GlassCard delay={0.9} className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">🧠 Smart Insight</h3>
      <div className="space-y-2">
        <p className={`text-lg font-bold ${color}`}>{level}</p>
        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full gradient-primary transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          You've completed <span className="font-semibold text-foreground">{pct}%</span> of your assignments.
          {pct < 60 && ' Try to finish at least one more task today!'}
          {pct >= 60 && pct < 80 && ' Almost there — keep the momentum!'}
          {pct >= 80 && ' Amazing work — you\'re crushing it!'}
        </p>
      </div>
    </GlassCard>
  );
}
