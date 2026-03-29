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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={cn(
      'glass rounded-2xl p-6 transition-all duration-300',
      hover && 'hover:shadow-glow hover:-translate-y-1 cursor-pointer',
      className
    )}
  >
    {children}
  </motion.div>
);
