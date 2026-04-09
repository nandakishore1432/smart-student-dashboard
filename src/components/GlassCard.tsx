import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const GlassCard = ({ children, className, hover = true, delay = 0 }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      'glass rounded-2xl p-6 transition-all duration-300 relative',
      hover && 'hover:shadow-glow hover:-translate-y-1 cursor-pointer',
      className
    )}
  >
    {children}
  </motion.div>
);
