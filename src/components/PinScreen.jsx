import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';

export default function PinScreen({ onUnlock, isDark, addToast }) {
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const CORRECT_PIN = '789012';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      onUnlock();
    } else {
      setIsShaking(true);
      addToast('Incorrect PIN.', 'error');
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
    }
  };

  const c = {
    bg: isDark ? 'bg-[#111111]' : 'bg-white',
    surface: isDark ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f7]',
    border: isDark ? 'border-[#2a2a2a]' : 'border-[#e8e8e8]',
    textPrimary: isDark ? 'text-[#e8e8e8]' : 'text-[#1a1a1a]',
    textMuted: isDark ? 'text-[#666]' : 'text-[#999]',
    inputBg: isDark ? 'bg-[#0a0a0a]' : 'bg-white',
  };

  return (
    <div className={`flex items-center justify-center h-[100dvh] ${c.bg} ${c.textPrimary} font-sans`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1, x: isShaking ? [-10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-[320px] p-8 rounded-3xl border ${c.border} ${c.surface} shadow-2xl flex flex-col items-center`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-[#e8e8e8]' : 'bg-[#1a1a1a]'}`}>
          <Lock size={24} className={isDark ? 'text-[#111]' : 'text-white'} />
        </div>
        
        <h2 className="text-xl font-bold mb-2 tracking-tight">Token Forge</h2>
        <p className={`text-[13px] text-center mb-8 ${c.textMuted}`}>
          Enter your PIN to access the application.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••••"
            maxLength={6}
            autoFocus
            className={`w-full px-5 py-3.5 text-center tracking-[0.5em] text-lg font-mono rounded-xl border ${c.border} ${c.inputBg} outline-none focus:border-blue-500 transition-colors`}
          />
          <button
            type="submit"
            disabled={!pin}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-[#e8e8e8] text-[#111] hover:bg-white'
                : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
            }`}
          >
            Unlock <ArrowRight size={14} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
