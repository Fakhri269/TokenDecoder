import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

const CORRECT_PIN = '789012';

export default function PinScreen({ onUnlock, isDark, addToast }) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  const handleKey = (val) => {
    if (pin.length >= 6) return;
    const next = pin + val;
    setPin(next);
    setError(false);
    if (next.length === 6) {
      setTimeout(() => verify(next), 150);
    }
  };

  const handleDelete = () => {
    setPin(p => p.slice(0, -1));
    setError(false);
  };

  const verify = (code) => {
    if (code === CORRECT_PIN) {
      onUnlock();
    } else {
      setShake(true);
      setError(true);
      addToast('Incorrect PIN.', 'error');
      setTimeout(() => {
        setShake(false);
        setPin('');
        setError(false);
      }, 600);
    }
  };

  const keys = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    [null,'0','del'],
  ];

  const c = {
    bg: isDark ? 'bg-black' : 'bg-[#fbfbfe]',
    cardBg: isDark ? 'bg-[#1c1c1e]' : 'bg-white',
    text: isDark ? 'text-white' : 'text-[#1d1d1f]',
    textMuted: isDark ? 'text-[#86868b]' : 'text-[#86868b]',
    keyBg: isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]',
    keyHover: isDark ? 'hover:bg-[#3a3a3c]' : 'hover:bg-[#e8e8ed]',
    shadow: isDark ? 'shadow-none border border-white/10' : 'shadow-apple border border-black/5',
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center font-sans ${c.bg}`}>
      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-[340px] mx-4 p-8 pt-10 pb-8 rounded-[32px] flex flex-col items-center relative overflow-hidden ${c.cardBg} ${c.shadow}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]'}`}>
          <Lock size={24} className={isDark ? 'text-[#0a84ff]' : 'text-[#0071e3]'} />
        </div>
        
        <h1 className={`text-xl font-bold tracking-tight mb-1 ${c.text}`}>
          Token Forge
        </h1>
        <p className={`text-[13px] text-center mb-8 ${c.textMuted}`}>
          Enter your PIN to continue
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3.5 mb-8 h-4 items-center">
          {[0,1,2,3,4,5].map(i => {
            const filled = i < pin.length;
            return (
              <motion.div
                key={i}
                animate={filled ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                  filled 
                    ? error 
                      ? 'bg-red-500 border-red-500' 
                      : (isDark ? 'bg-[#0a84ff] border-[#0a84ff]' : 'bg-[#0071e3] border-[#0071e3]')
                    : (isDark ? 'bg-transparent border-[#3a3a3c]' : 'bg-transparent border-[#e5e5ea]')
                }`}
              />
            );
          })}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full px-2">
          {keys.flat().map((k, idx) => {
            if (k === null) return <div key={idx} />;
            if (k === 'del') return (
              <motion.button
                key="del"
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className={`h-14 rounded-2xl flex items-center justify-center transition-colors ${c.keyBg} ${c.keyHover} ${c.text}`}
              >
                <Delete size={20} strokeWidth={2.5} className={c.textMuted} />
              </motion.button>
            );
            return (
              <motion.button
                key={k}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleKey(k)}
                className={`h-14 rounded-2xl text-[22px] font-semibold flex items-center justify-center transition-colors ${c.keyBg} ${c.keyHover} ${c.text}`}
              >
                {k}
              </motion.button>
            );
          })}
        </div>

        <p className={`mt-8 text-[10px] font-semibold tracking-widest uppercase ${c.textMuted} opacity-60`}>
          Created by Fakhri
        </p>
      </motion.div>
    </div>
  );
}
