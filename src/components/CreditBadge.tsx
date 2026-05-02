import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';

export function CreditBadge() {
  const { balance } = useCredits();
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate('/rewards')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 rounded-xl gradient-primary px-3 py-1.5 text-primary-foreground shadow-glow"
      title="View rewards"
    >
      <Coins className="h-4 w-4" />
      <span className="text-sm font-bold tabular-nums">{balance}</span>
    </motion.button>
  );
}
