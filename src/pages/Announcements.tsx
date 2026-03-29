import { motion } from 'framer-motion';
import { Megaphone, Clock } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { formatDistanceToNow } from 'date-fns';

const priorityStyles: Record<string, string> = {
  high: 'border-l-destructive bg-destructive/5',
  medium: 'border-l-warning bg-warning/5',
  low: 'border-l-primary bg-primary/5',
};

export default function Announcements() {
  const { announcements, isLoading } = useAnnouncements();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground text-sm">Latest updates and notices</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>
      ) : announcements.length === 0 ? (
        <GlassCard hover={false} className="text-center py-12">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No announcements yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard hover={false} className={`border-l-4 ${priorityStyles[a.priority] || priorityStyles.low}`}>
                <div className="flex items-start gap-3">
                  <div className="gradient-primary rounded-xl p-2 shrink-0 mt-0.5">
                    <Megaphone className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.content}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
