import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Copy, Download, Trash2, Settings, Minimize2, Maximize2,
  Lock, Unlock, Link, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { decryptToken } from './utils/crypto';
import OutputViewer from './components/OutputViewer';
import SettingsDrawer from './components/SettingsDrawer';
import Toast from './components/Toast';
import PinScreen from './components/PinScreen';

function findUrlInObject(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (const key in obj) {
    if (typeof obj[key] === 'string' && /^https?:\/\//i.test(obj[key])) {
      return obj[key];
    } else if (typeof obj[key] === 'object') {
      const found = findUrlInObject(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token') || '';
    }
    return '';
  });
  const [json, setJson] = useState('');
  const [parsedObj, setParsedObj] = useState(null);
  const [isMinified, setIsMinified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(getInitialTheme);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tokenForgeAuth') === 'true';
    }
    return false;
  });

  const [settings, setSettings] = useState({
    key: 'YourSuperSecretKeyForExamOnLan13',
    iv: 'YourSuperSecretI',
  });
  const toastIdRef = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(p => p === 'dark' ? 'light' : 'dark'), []);
  const isDark = theme === 'dark';

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  const handleDecrypt = useCallback(async () => {
    const trimmed = token.trim();
    if (!trimmed) { addToast('Input is empty.', 'error'); inputRef.current?.focus(); return; }
    setLoading(true); setJson(''); setParsedObj(null); setIsMinified(false);
    try {
      const plain = await decryptToken(trimmed, settings.key, settings.iv);
      const obj = JSON.parse(plain);
      setParsedObj(obj); setJson(JSON.stringify(obj, null, 2));
      addToast('Decrypted successfully.');
    } catch { addToast('Decryption failed. Check your config.', 'error'); }
    finally { setLoading(false); }
  }, [token, settings, addToast]);

  const handleCopy = useCallback(async () => {
    if (!json) return;
    try { await navigator.clipboard.writeText(json); }
    catch { const t = document.createElement('textarea'); t.value = json; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    addToast('Copied to clipboard.');
  }, [json, addToast]);

  const handleDownload = useCallback(() => {
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `decoded-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url); addToast('Downloaded.');
  }, [json, addToast]);

  const handleMinify = useCallback(() => {
    if (!parsedObj) return;
    const next = !isMinified; setIsMinified(next);
    setJson(next ? JSON.stringify(parsedObj) : JSON.stringify(parsedObj, null, 2));
  }, [parsedObj, isMinified]);

  const handleClear = useCallback(() => {
    setToken(''); setJson(''); setParsedObj(null); setIsMinified(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!parsedObj) return;
    const url = findUrlInObject(parsedObj);
    if (!url) {
      addToast('No link found in the result.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      addToast('Link copied from result.');
    } catch {
      addToast('Failed to copy link.', 'error');
    }
  }, [parsedObj, addToast]);

  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleDecrypt(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleDecrypt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDecrypt();
    }
  };

  const c = {
    appBg: isDark ? 'bg-black' : 'bg-[#ffffff]',
    inputPill: isDark ? 'bg-[#1c1c1e] text-white placeholder-gray-500' : 'bg-[#f0f0f5] text-black placeholder-gray-400',
    inputBorderFocus: isDark ? 'focus:ring-white/20' : 'focus:ring-black/10',
    cardBg: isDark ? 'bg-[#1c1c1e]' : 'bg-[#f9f9fb]',
    cardBorder: isDark ? 'border-[#2c2c2e]' : 'border-[#ebebf0]',
    text: isDark ? 'text-white' : 'text-black',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
  };

  if (!isAuthenticated) {
    return (
      <>
        <PinScreen 
          onUnlock={() => {
            setIsAuthenticated(true);
            sessionStorage.setItem('tokenForgeAuth', 'true');
          }} 
          isDark={isDark} 
          addToast={addToast} 
        />
        <Toast toasts={toasts} isDark={isDark} />
      </>
    );
  }

  const hasResult = !!json;

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden font-sans transition-colors duration-500 ${c.appBg}`}>
      
      {/* Absolute Header (Top Right Settings) */}
      <div className="absolute top-0 right-0 p-6 z-20">
        <button
          onClick={() => setSettingsOpen(true)}
          className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-colors ${
            isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'
          }`}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Main Animated Container */}
      <motion.main 
        layout
        className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full px-4 md:px-8 relative"
        initial={false}
        animate={{
          justifyContent: hasResult ? 'flex-start' : 'center',
          paddingTop: hasResult ? '4rem' : '0rem'
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300, bounce: 0 }}
      >
        
        {/* Logo/Title (Visible only when empty to keep focus, or small when hasResult) */}
        <motion.div layout className="flex flex-col items-center mb-8">
          <motion.div 
            layout
            className={`flex items-center justify-center rounded-[18px] mb-4 ${isDark ? 'bg-[#1c1c1e]' : 'bg-[#f0f0f5]'}`}
            animate={{ width: hasResult ? 40 : 64, height: hasResult ? 40 : 64, borderRadius: hasResult ? 12 : 18 }}
          >
            <Lock size={hasResult ? 18 : 28} className={isDark ? 'text-[#0a84ff]' : 'text-[#0071e3]'} />
          </motion.div>
          <motion.h1 
            layout
            className={`font-semibold tracking-tight ${c.text}`}
            animate={{ fontSize: hasResult ? '18px' : '28px', opacity: hasResult ? 0 : 1 }}
            style={{ display: hasResult ? 'none' : 'block' }}
          >
            Token Forge
          </motion.h1>
        </motion.div>

        {/* The Spotlight Input Pill */}
        <motion.div 
          layout
          className={`relative w-full max-w-xl mx-auto flex items-center shadow-sm transition-shadow focus-within:shadow-md rounded-full overflow-hidden ${c.inputPill} ring-1 ring-transparent ${c.inputBorderFocus} focus-within:ring-2`}
          style={{ minHeight: '60px' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your encrypted token..."
            spellCheck={false}
            className={`w-full h-full bg-transparent border-none outline-none px-6 py-4 text-[16px] md:text-[17px] ${c.text}`}
          />
          
          <AnimatePresence>
            {token.trim() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 pr-3"
              >
                {token.trim() && !hasResult && (
                  <button
                    onClick={handleDecrypt}
                    disabled={loading}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${isDark ? 'bg-[#0a84ff]' : 'bg-[#0071e3]'} hover:opacity-80 transition-opacity disabled:opacity-50`}
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Unlock size={16} />}
                  </button>
                )}
                {hasResult && (
                  <button
                    onClick={handleClear}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-[#2c2c2e] hover:bg-[#3a3a3c]' : 'bg-[#e5e5ea] hover:bg-[#d1d1d6]'}`}
                  >
                    <X size={16} className={c.text} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* The Result Card */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.05 }}
              className={`w-full mt-8 flex flex-col flex-1 min-h-0 rounded-[28px] overflow-hidden border shadow-xl ${c.cardBg} ${c.cardBorder}`}
              style={{ marginBottom: '2rem' }}
            >
              {/* Toolbar */}
              <div className={`flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0 ${c.cardBorder}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`text-[12px] sm:text-[13px] font-semibold tracking-tight ${c.textMuted}`}>Decrypted Result</span>
                  <span className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-[#2c2c2e] text-[#a1a1a6]' : 'bg-[#e5e5ea] text-[#8e8e93]'}`}>
                    {json.split('\n').length} lines
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Btn onClick={handleCopyLink} title="Salin Link" isDark={isDark}><Link size={15} /></Btn>
                  <Btn onClick={handleCopy} title="Copy JSON" isDark={isDark}><Copy size={15} /></Btn>
                  <Btn onClick={handleDownload} title="Download" isDark={isDark}><Download size={15} /></Btn>
                  <div className={`w-px h-4 mx-1 sm:mx-2 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                  <Btn onClick={handleMinify} title={isMinified ? 'Prettify' : 'Minify'} isDark={isDark}>
                    {isMinified ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
                  </Btn>
                </div>
              </div>

              {/* JSON Content */}
              <div className="flex-1 min-h-0 overflow-auto bg-transparent p-2 sm:p-4">
                <OutputViewer json={json} isEmpty={false} isDark={isDark} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={s => { setSettings(s); setSettingsOpen(false); addToast('Settings saved.'); }}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
      <Toast toasts={toasts} isDark={isDark} />
    </div>
  );
}

function Btn({ onClick, children, title, isDark }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-full transition-all ${
        isDark 
          ? 'text-[#a1a1a6] hover:text-white hover:bg-[#2c2c2e]' 
          : 'text-[#8e8e93] hover:text-black hover:bg-[#e5e5ea]'
      }`}
    >
      {children}
    </button>
  );
}
