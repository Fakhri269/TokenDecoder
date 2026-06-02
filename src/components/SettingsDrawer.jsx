import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsDrawer({ isOpen, onClose, settings, onSave, isDark, onToggleTheme }) {
  const [keyVal, setKeyVal] = useState(settings.key);
  const [ivVal, setIvVal] = useState(settings.iv);

  useEffect(() => { setKeyVal(settings.key); setIvVal(settings.iv); }, [settings]);

  const handleSave = () => onSave({ key: keyVal, iv: ivVal });

  const bg     = isDark ? 'bg-[#141414]' : 'bg-white';
  const border = isDark ? 'border-[#2a2a2a]' : 'border-[#e8e8e8]';
  const input  = isDark
    ? 'bg-[#1e1e1e] border-[#2e2e2e] text-[#e8e8e8] focus:border-[#555] placeholder:text-[#3a3a3a]'
    : 'bg-[#f7f7f7] border-[#e0e0e0] text-[#1a1a1a] focus:border-[#aaa] placeholder:text-[#ccc]';
  const muted  = isDark ? 'text-[#555]' : 'text-[#aaa]';
  const label  = isDark ? 'text-[#aaa]' : 'text-[#555]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.22 }}
            className={`fixed top-0 right-0 w-[380px] max-w-[92vw] h-full border-l z-50 flex flex-col ${bg} ${border}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${border}`}>
              <span className={`text-[15px] font-semibold tracking-[-0.2px] ${isDark ? 'text-[#e8e8e8]' : 'text-[#1a1a1a]'}`}>
                Settings
              </span>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-md transition-colors ${muted} ${isDark ? 'hover:bg-[#222] hover:text-[#ccc]' : 'hover:bg-[#f0f0f0] hover:text-[#333]'}`}
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-6 py-6 space-y-8 overflow-y-auto">

              {/* Appearance */}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${muted}`}>Appearance</p>
                <div className={`flex items-center justify-between py-3 px-4 rounded-xl border ${isDark ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-[#ebebeb] bg-[#f7f7f7]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#252525]' : 'bg-white border border-[#e8e8e8]'}`}>
                      {isDark ? <Moon size={14} className={muted} /> : <Sun size={14} className="text-[#aaa]" />}
                    </div>
                    <div>
                      <p className={`text-[13px] font-medium ${isDark ? 'text-[#ccc]' : 'text-[#444]'}`}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className={`text-[11px] ${muted}`}>Toggle interface theme</p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={onToggleTheme}
                    role="switch"
                    aria-checked={isDark}
                    className={`relative w-10 h-[22px] rounded-full transition-colors ${isDark ? 'bg-[#e8e8e8]' : 'bg-[#ccc]'}`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', damping: 24, stiffness: 400 }}
                      className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm ${isDark ? 'left-[22px]' : 'left-[3px]'}`}
                      style={{ backgroundColor: isDark ? '#111' : '#fff' }}
                    />
                  </button>
                </div>
              </div>

              {/* Encryption */}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${muted}`}>Encryption</p>
                <div className="space-y-5">
                  <div>
                    <label className={`block text-[12px] font-medium mb-1.5 ${label}`}>AES Key</label>
                    <input
                      type="text"
                      value={keyVal}
                      onChange={e => setKeyVal(e.target.value)}
                      maxLength={32}
                      spellCheck={false}
                      className={`w-full px-3 py-2.5 border rounded-lg font-mono text-[12px] outline-none transition-all ${input}`}
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className={`text-[11px] ${muted}`}>32 characters required</span>
                      <span className={`text-[11px] font-mono ${keyVal.length === 32 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {keyVal.length}/32
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[12px] font-medium mb-1.5 ${label}`}>IV (16 characters)</label>
                    <input
                      type="text"
                      value={ivVal}
                      onChange={e => setIvVal(e.target.value)}
                      maxLength={16}
                      spellCheck={false}
                      className={`w-full px-3 py-2.5 border rounded-lg font-mono text-[12px] outline-none transition-all ${input}`}
                    />
                    <div className="flex justify-between mt-1.5">
                      <span className={`text-[11px] ${muted}`}>16 characters required</span>
                      <span className={`text-[11px] font-mono ${ivVal.length === 16 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {ivVal.length}/16
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-5 border-t ${border}`}>
              <button
                onClick={handleSave}
                disabled={keyVal.length !== 32 || ivVal.length !== 16}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark ? 'bg-[#e8e8e8] text-[#111] hover:bg-white' : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                }`}
              >
                <Save size={14} />
                Save Changes
              </button>
              <div className={`mt-4 text-center text-[10px] tracking-wider uppercase font-semibold ${muted}`}>
                Created by Fakhri
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
