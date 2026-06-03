import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Copy, Download, Trash2, Settings, Minimize2, Maximize2,
  Lock, Unlock, ClipboardPaste, Link
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
  const [mobileTab, setMobileTab] = useState('input');
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
  const textareaRef = useRef(null);
  const toastIdRef = useRef(0);

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
    if (!trimmed) { addToast('Input is empty.', 'error'); textareaRef.current?.focus(); return; }
    setLoading(true); setJson(''); setParsedObj(null); setIsMinified(false);
    try {
      const plain = await decryptToken(trimmed, settings.key, settings.iv);
      const obj = JSON.parse(plain);
      setParsedObj(obj); setJson(JSON.stringify(obj, null, 2));
      addToast('Decrypted successfully.'); setMobileTab('output');
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
    setMobileTab('input'); textareaRef.current?.focus();
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text);
      addToast('Pasted from clipboard.');
    } catch {
      addToast('Failed to paste. Check permissions.', 'error');
    }
  }, [addToast]);

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

  const handleDrop = useCallback(e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) { const r = new FileReader(); r.onload = () => setToken(r.result); r.readAsText(file); }
  }, []);

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

  const c = {
    appBg: isDark ? 'bg-black' : 'bg-[#f2f2f7]',
    cardBg: isDark ? 'bg-[#1c1c1e]' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-black/5',
    cardShadow: isDark ? 'shadow-none' : 'shadow-apple',
    text: isDark ? 'text-white' : 'text-[#1d1d1f]',
    textMuted: isDark ? 'text-[#86868b]' : 'text-[#86868b]',
    segContainer: isDark ? 'bg-[#1c1c1e]' : 'bg-[#e3e3e8]',
    segActive: isDark ? 'bg-[#3a3a3c] text-white shadow-sm' : 'bg-white text-black shadow-sm',
    segInactive: isDark ? 'text-[#86868b]' : 'text-[#86868b]',
    primaryBg: isDark ? 'bg-[#0a84ff]' : 'bg-[#0071e3]',
    primaryHover: isDark ? 'hover:bg-[#007aff]' : 'hover:bg-[#0077ed]',
    glassBar: isDark ? 'bg-[#1c1c1e]/80 border-white/10' : 'bg-white/80 border-black/5',
  };

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden font-sans ${c.appBg}`}>
      
      {/* ══ HEADER ══ */}
      <header className={`flex items-center justify-between px-6 py-4 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${c.cardBg} ${c.cardShadow} ${c.cardBorder} border`}>
            <Lock size={16} className={isDark ? 'text-[#0a84ff]' : 'text-[#0071e3]'} />
          </div>
          <span className={`font-semibold text-[17px] tracking-tight ${c.text}`}>
            Token Forge
          </span>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${c.cardBg} ${c.cardBorder} border ${c.cardShadow} ${c.text}`}
        >
          <Settings size={16} />
        </button>
      </header>

      {/* ══ MOBILE SEGMENTED CONTROL ══ */}
      <div className="md:hidden px-4 pb-4 shrink-0">
        <div className={`flex p-1 rounded-lg ${c.segContainer}`}>
          {[
            { key: 'input', label: 'Input' },
            { key: 'output', label: 'Result' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-all ${
                mobileTab === key ? c.segActive : c.segInactive
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="flex-1 flex flex-col md:flex-row px-4 pb-[88px] md:pb-6 gap-6 md:gap-6 overflow-hidden min-h-0 max-w-[1400px] mx-auto w-full">
        
        {/* INPUT PANEL */}
        <div
          className={`${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 rounded-[20px] overflow-hidden ${c.cardBg} ${c.cardShadow}`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Panel Header */}
          <div className={`flex items-center justify-between px-6 py-3 border-b ${c.cardBorder}`}>
            <span className={`text-[13px] font-semibold tracking-tight ${c.text}`}>Input Token</span>
            <div className="flex items-center gap-4">
              <button onClick={handlePaste} className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${isDark ? 'text-[#0a84ff] hover:text-[#409cff]' : 'text-[#0071e3] hover:text-[#0077ed]'}`}>
                <ClipboardPaste size={14} /> Paste
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative flex flex-col">
            <textarea
              ref={textareaRef}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste encrypted Base64 token here..."
              spellCheck={false}
              className={`flex-1 w-full resize-none bg-transparent font-mono text-[14px] leading-relaxed p-6 outline-none pb-20 ${c.text}`}
            />
            {/* Desktop-only internal Decrypt button */}
            <div className={`hidden md:flex absolute bottom-0 left-0 right-0 p-4 justify-between items-center bg-gradient-to-t from-${isDark ? '[#1c1c1e]' : 'white'} via-${isDark ? '[#1c1c1e]' : 'white'}/90 to-transparent pt-10`}>
              <span className={`text-[12px] font-medium opacity-70 ${c.textMuted}`}>
                {token.length} characters
              </span>
              <button
                onClick={handleDecrypt}
                disabled={loading || !token.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-white ${c.primaryBg} ${c.primaryHover}`}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Unlock size={14} /> Decrypt
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 rounded-[20px] overflow-hidden ${c.cardBg} ${c.cardShadow}`}>
          {/* Panel Header */}
          <div className={`flex items-center justify-between px-6 py-3 border-b shrink-0 ${c.cardBorder}`}>
            <div className="flex items-center gap-3">
              <span className={`text-[13px] font-semibold tracking-tight ${c.text}`}>Result</span>
              {json && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${isDark ? 'bg-[#2c2c2e] text-[#a1a1a6]' : 'bg-[#f5f5f7] text-[#86868b]'}`}>
                  {json.split('\n').length} lines
                </span>
              )}
            </div>

            {json ? (
              <div className="flex items-center gap-1">
                <Btn onClick={handleCopyLink} title="Salin Link" isDark={isDark}><Link size={16} /></Btn>
                <div className={`w-px h-4 mx-2 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                <Btn onClick={handleCopy} title="Copy JSON" isDark={isDark}><Copy size={16} /></Btn>
                <Btn onClick={handleDownload} title="Download" isDark={isDark}><Download size={16} /></Btn>
                <Btn onClick={handleMinify} title={isMinified ? 'Prettify' : 'Minify'} isDark={isDark}>
                  {isMinified ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </Btn>
                <div className={`w-px h-4 mx-2 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                <Btn onClick={handleClear} title="Clear" isDark={isDark} danger><Trash2 size={16} /></Btn>
              </div>
            ) : <div className="h-8" />}
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-transparent">
            <OutputViewer json={json} isEmpty={!json && !loading} isDark={isDark} />
          </div>
        </div>
      </div>

      {/* ══ MOBILE BOTTOM FLOATING BAR ══ */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl ${c.glassBar} z-20`}>
        <button
          onClick={handleDecrypt}
          disabled={loading || !token.trim()}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] text-[15px] font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-white ${c.primaryBg} ${c.primaryHover}`}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Decrypting...
              </motion.span>
            ) : (
              <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <Unlock size={18} />
                Decrypt Token
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

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

function Btn({ onClick, children, title, isDark, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-all ${
        danger
          ? 'text-red-500 hover:bg-red-500/10'
          : isDark 
            ? 'text-[#86868b] hover:text-white hover:bg-[#2c2c2e]' 
            : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
      }`}
    >
      {children}
    </button>
  );
}
