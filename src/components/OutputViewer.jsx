import { useMemo } from 'react';
import { highlightJSON } from '../utils/highlight';
import { Code, FileJson } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OutputViewer({ json, isEmpty, isDark }) {
  const highlighted = useMemo(() => json ? highlightJSON(json) : '', [json]);
  const lines = useMemo(() => json ? json.split('\n') : [], [json]);

  return (
    <div className={`relative h-full w-full overflow-hidden flex ${isDark ? 'bg-[#111113]' : 'bg-white'}`}>
      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`w-14 h-14 mb-5 rounded-2xl flex items-center justify-center border ${
              isDark
                ? 'bg-white/[0.03] border-white/[0.07]'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <FileJson size={22} className={isDark ? 'text-zinc-600' : 'text-gray-300'} />
          </motion.div>

          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.07, ease: 'easeOut' }}
          >
            <h3 className={`text-sm font-semibold mb-1.5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              No output yet
            </h3>
            <p className={`text-xs leading-relaxed max-w-[220px] ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>
              Paste an encrypted token on the left and press Decrypt
            </p>
          </motion.div>

          {/* Keyboard hint */}
          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.14, ease: 'easeOut' }}
            className={`mt-5 flex items-center gap-1.5 text-xs ${isDark ? 'text-zinc-700' : 'text-gray-300'}`}
          >
            <kbd className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-gray-50 border-gray-200'}`}>
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-gray-50 border-gray-200'}`}>
              Enter
            </kbd>
            <span className="ml-0.5">to decrypt</span>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex h-full w-full overflow-auto"
        >
          {/* Line numbers */}
          <div className={`flex-shrink-0 py-5 border-r select-none sticky left-0 min-h-full ${
            isDark ? 'bg-[#0e0e10] border-white/[0.05]' : 'bg-gray-50/80 border-gray-100'
          }`}>
            {lines.map((_, i) => (
              <div
                key={i}
                className={`px-4 text-right text-xs leading-6 font-mono tabular-nums ${
                  isDark ? 'text-zinc-700' : 'text-gray-300'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code */}
          <pre
            className={`flex-1 py-5 px-6 font-mono text-[13px] leading-6 whitespace-pre overflow-x-auto ${
              isDark ? 'text-zinc-300' : 'text-gray-700'
            }`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </motion.div>
      )}
    </div>
  );
}
