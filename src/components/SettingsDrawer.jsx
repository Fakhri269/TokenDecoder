import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsDrawer({ isOpen, onClose, settings, onSave, isDark, onToggleTheme }) {
  const [keyVal, setKeyVal] = useState(settings.key);
  const [ivVal, setIvVal] = useState(settings.iv);

  useEffect(() => { setKeyVal(settings.key); setIvVal(settings.iv); }, [settings]);

  const handleSave = () => onSave({ key: keyVal, iv: ivVal });

  const c = {
    bg: isDark ? 'bg-[#1c1c1e]' : 'bg-[#ffffff]',
    border: isDark ? 'border-white/10' : 'border-black/5',
    inputBg: isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]',
    inputFocus: isDark ? 'focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff]' : 'focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]',
    text: isDark ? 'text-white' : 'text-[#1d1d1f]',
    textMuted: isDark ? 'text-[#86868b]' : 'text-[#86868b]',
    btnBg: isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]',
    btnHover: isDark ? 'hover:bg-[#3a3a3c]' : 'hover:bg-[#e8e8ed]',
    primaryBg: isDark ? 'bg-[#0a84ff]' : 'bg-[#0071e3]',
    primaryHover: isDark ? 'hover:bg-[#007aff]' : 'hover:bg-[#0077ed]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={`fixed top-0 right-0 w-[400px] max-w-[92vw] h-full shadow-2xl z-50 flex flex-col ${c.bg} ${c.border}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-8 py-6 border-b ${c.border}`}>
              <span className={`text-[17px] font-bold tracking-tight ${c.text}`}>
                Settings
              </span>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${c.btnBg} ${c.btnHover} ${c.textMuted}`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">
              
              {/* Appearance */}
              <div>
                <p className={`text-[12px] font-bold uppercase tracking-widest mb-4 ${c.textMuted}`}>Appearance</p>
                <div className={`flex items-center justify-between p-4 rounded-[16px] border ${c.border} ${isDark ? 'bg-[#1c1c1e]' : 'bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.btnBg}`}>
                      {isDark ? <Moon size={16} className={c.textMuted} /> : <Sun size={16} className={c.textMuted} />}
                    </div>
                    <div>
                      <p className={`text-[14px] font-semibold ${c.text}`}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className={`text-[12px] ${c.textMuted}`}>Toggle interface theme</p>
                    </div>
                  </div>

                  <button
                    onClick={onToggleTheme}
                    className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? 'bg-[#34c759]' : 'bg-[#e5e5ea]'}`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', damping: 24, stiffness: 400 }}
                      className={`absolute top-[2px] w-6 h-6 rounded-full bg-white shadow-sm ${isDark ? 'left-[22px]' : 'left-[2px]'}`}
                    />
                  </button>
                </div>
              </div>

              {/* Encryption */}
              <div>
                <p className={`text-[12px] font-bold uppercase tracking-widest mb-4 ${c.textMuted}`}>Encryption</p>
                <div className="space-y-5">
                  <div>
                    <label className={`block text-[13px] font-semibold mb-2 ${c.text}`}>AES Key</label>
                    <input
                      type="text"
                      value={keyVal}
                      onChange={e => setKeyVal(e.target.value)}
                      maxLength={32}
                      spellCheck={false}
                      className={`w-full px-4 py-3.5 border rounded-2xl font-mono text-[13px] outline-none transition-all ${c.inputBg} ${c.border} ${c.text} ${c.inputFocus}`}
                    />
                    <div className="flex justify-between mt-2 px-1">
                      <span className={`text-[12px] ${c.textMuted}`}>32 characters required</span>
                      <span className={`text-[12px] font-mono font-medium ${keyVal.length === 32 ? (isDark ? 'text-[#32d74b]' : 'text-[#34c759]') : (isDark ? 'text-[#ff453a]' : 'text-[#ff3b30]')}`}>
                        {keyVal.length}/32
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[13px] font-semibold mb-2 ${c.text}`}>Initialization Vector (IV)</label>
                    <input
                      type="text"
                      value={ivVal}
                      onChange={e => setIvVal(e.target.value)}
                      maxLength={16}
                      spellCheck={false}
                      className={`w-full px-4 py-3.5 border rounded-2xl font-mono text-[13px] outline-none transition-all ${c.inputBg} ${c.border} ${c.text} ${c.inputFocus}`}
                    />
                    <div className="flex justify-between mt-2 px-1">
                      <span className={`text-[12px] ${c.textMuted}`}>16 characters required</span>
                      <span className={`text-[12px] font-mono font-medium ${ivVal.length === 16 ? (isDark ? 'text-[#32d74b]' : 'text-[#34c759]') : (isDark ? 'text-[#ff453a]' : 'text-[#ff3b30]')}`}>
                        {ivVal.length}/16
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-8 py-6 border-t ${c.border}`}>
              <button
                onClick={handleSave}
                disabled={keyVal.length !== 32 || ivVal.length !== 16}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[15px] font-semibold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-white ${c.primaryBg} ${c.primaryHover}`}
              >
                <Save size={16} />
                Save Changes
              </button>
              <div className={`mt-5 text-center text-[10px] tracking-widest uppercase font-bold ${c.textMuted} opacity-60`}>
                Token Forge — Created by Fakhri
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
