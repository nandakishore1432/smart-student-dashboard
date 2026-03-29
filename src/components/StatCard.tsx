import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: 'primary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

const colorMap = {
  primary: 'from-primary to-primary/70',
  accent: 'from-accent to-accent/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
};

export const StatCard = ({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) => (
  <GlassCard delay={delay} className="relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className="text-xs font-medium text-success">{trend}</p>
        )}
      </div>
      <div className={`rounded-xl bg-gradient-to-br ${colorMap[color]} p-3`}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
    </div>
    <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-10 blur-2xl`} />
  </GlassCard>
);
