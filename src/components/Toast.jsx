import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toasts, isDark }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold shadow-xl border backdrop-blur-xl ${
              t.type === 'success'
                ? isDark
                  ? 'bg-indigo-950/80 border-indigo-500/25 text-indigo-200 shadow-indigo-900/50'
                  : 'bg-white/90 border-indigo-100 text-indigo-800 shadow-indigo-100'
                : isDark
                  ? 'bg-red-950/80 border-red-500/25 text-red-200 shadow-red-900/50'
                  : 'bg-white/90 border-red-100 text-red-700 shadow-red-100'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              : <AlertCircle size={16} className="text-red-500 shrink-0" />
            }
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
