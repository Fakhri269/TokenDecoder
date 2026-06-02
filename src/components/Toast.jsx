import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white shadow-lg border border-gray-100"
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} className="text-gray-900" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
            <span className="text-sm font-medium text-gray-800">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
