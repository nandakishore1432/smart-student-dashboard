import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] glass rounded-full px-4 py-2 flex items-center gap-2 shadow-glow text-sm font-medium border border-warning/40"
          role="status"
          aria-live="polite"
        >
          <WifiOff className="h-4 w-4 text-warning" />
          <span>You're offline — showing cached data</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
