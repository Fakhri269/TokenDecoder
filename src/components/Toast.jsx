import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toasts, isDark }) {
  const c = {
    successBg: isDark ? 'bg-[#1c1c1e]/90 border-[#32d74b]/30' : 'bg-white/90 border-[#34c759]/20',
    errorBg: isDark ? 'bg-[#1c1c1e]/90 border-[#ff453a]/30' : 'bg-white/90 border-[#ff3b30]/20',
    successText: isDark ? 'text-[#32d74b]' : 'text-[#34c759]',
    errorText: isDark ? 'text-[#ff453a]' : 'text-[#ff3b30]',
    text: isDark ? 'text-white' : 'text-[#1d1d1f]',
    shadow: isDark ? 'shadow-none' : 'shadow-apple',
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-full text-[14px] font-semibold border backdrop-blur-xl ${c.shadow} ${
              t.type === 'success' ? c.successBg : c.errorBg
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle2 size={18} className={`${c.successText} shrink-0`} />
              : <AlertCircle size={18} className={`${c.errorText} shrink-0`} />
            }
            <span className={c.text}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
