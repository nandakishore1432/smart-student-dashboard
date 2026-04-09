import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { motion } from 'framer-motion';

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

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 800;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return <>{display}</>;
}

export const StatCard = ({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) => (
  <GlassCard delay={delay} className="relative overflow-hidden group">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-extrabold text-foreground tracking-tight">
          {typeof value === 'number' ? <AnimatedNumber value={value} delay={delay} /> : value}
        </p>
        {trend && (
          <p className="text-xs font-medium text-success">{trend}</p>
        )}
      </div>
      <motion.div
        whileHover={{ rotate: 12, scale: 1.1 }}
        className={`rounded-xl bg-gradient-to-br ${colorMap[color]} p-3 shadow-lg`}
      >
        <Icon className="h-5 w-5 text-primary-foreground" />
      </motion.div>
    </div>
    {/* Glow orb */}
    <div className={`absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
    {/* Shimmer on hover */}
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  </GlassCard>
);
