'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function DonationPopup({ show, message, onClose }: { show: boolean; message: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-20 lg:bottom-6 left-1/2 z-50 glass glow-teal rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg max-w-sm"
        >
          <span className="text-sm font-medium">{message}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
