import { GlassCard } from './GlassCard';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <GlassCard hover={false} className={className}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-muted rounded-lg w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded-lg" style={{ width: `${60 + Math.random() * 30}%` }} />
        ))}
      </div>
    </GlassCard>
  );
}
