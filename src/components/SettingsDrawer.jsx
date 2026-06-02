import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsDrawer({ isOpen, onClose, settings, onSave }) {
  const [keyVal, setKeyVal] = useState(settings.key);
  const [ivVal, setIvVal] = useState(settings.iv);

  useEffect(() => {
    setKeyVal(settings.key);
    setIvVal(settings.iv);
  }, [settings]);

  const handleSave = () => {
    onSave({ key: keyVal, iv: ivVal });
  };

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
            className="fixed inset-0 bg-black/20 z-40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed top-0 right-0 w-[400px] max-w-[90vw] h-full bg-white border-l border-gray-200 z-50 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Settings</h3>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Key
                </label>
                <input
                  type="text"
                  value={keyVal}
                  onChange={(e) => setKeyVal(e.target.value)}
                  maxLength={32}
                  spellCheck={false}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm font-mono text-sm text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-gray-500">Requires exactly 32 characters</p>
                  <div className={`text-xs font-mono ${keyVal.length === 32 ? 'text-gray-500' : 'text-red-500'}`}>
                    {keyVal.length}/32
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initialization Vector (IV)
                </label>
                <input
                  type="text"
                  value={ivVal}
                  onChange={(e) => setIvVal(e.target.value)}
                  maxLength={16}
                  spellCheck={false}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm font-mono text-sm text-gray-900 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-gray-500">Requires exactly 16 characters</p>
                  <div className={`text-xs font-mono ${ivVal.length === 16 ? 'text-gray-500' : 'text-red-500'}`}>
                    {ivVal.length}/16
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleSave}
                disabled={keyVal.length !== 32 || ivVal.length !== 16}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} /> 
                Save Changes
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
