import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function SplashScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[120px]"
        style={{ background: 'var(--gradient-primary)', top: '-10%', left: '-10%' }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'var(--gradient-accent)', bottom: '-10%', right: '-10%' }}
        animate={{ scale: [1.1, 0.95, 1.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="gradient-primary rounded-2xl p-5 shadow-glow-lg animate-pulse-glow"
        >
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <div className="text-center space-y-1">
          <div className="text-lg font-extrabold tracking-tight gradient-text">Smart Student Hub</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
