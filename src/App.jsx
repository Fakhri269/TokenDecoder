import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Copy, Download, Trash2, Settings, Minimize2, Maximize2,
  Lock, FileJson, Edit3, Unlock, ClipboardPaste, Link
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
    headerBg: isDark ? 'bg-[#1c1c1e]/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md',
    headerBorder: isDark ? 'border-white/10' : 'border-black/5',
    cardBg: isDark ? 'bg-[#1c1c1e]' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-black/5',
    cardShadow: isDark ? 'shadow-none' : 'shadow-apple',
    text: isDark ? 'text-white' : 'text-[#1d1d1f]',
    textMuted: isDark ? 'text-[#86868b]' : 'text-[#86868b]',
    btnBg: isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]',
    btnHover: isDark ? 'hover:bg-[#3a3a3c]' : 'hover:bg-[#e8e8ed]',
    primaryBg: isDark ? 'bg-[#0a84ff]' : 'bg-[#0071e3]',
    primaryHover: isDark ? 'hover:bg-[#007aff]' : 'hover:bg-[#0077ed]',
  };

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden font-sans`}>
      {/* ══ HEADER ══ */}
      <header className={`flex items-center justify-between px-6 h-16 border-b shrink-0 sticky top-0 z-10 ${c.headerBg} ${c.headerBorder}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${isDark ? 'bg-[#2c2c2e]' : 'bg-[#f5f5f7]'}`}>
            <Lock size={16} className={isDark ? 'text-[#0a84ff]' : 'text-[#0071e3]'} />
          </div>
          <span className={`font-semibold text-[17px] tracking-tight ${c.text}`}>
            Token Forge
          </span>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all ${c.btnBg} ${c.btnHover} ${c.text}`}
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Config</span>
        </button>
      </header>

      {/* ══ MOBILE TABS ══ */}
      <div className={`md:hidden flex shrink-0 border-b p-2 gap-2 ${c.cardBg} ${c.headerBorder}`}>
        {[
          { key: 'input', label: 'Input', icon: <Edit3 size={14} /> },
          { key: 'output', label: 'Result', icon: <FileJson size={14} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-medium flex justify-center items-center gap-2 transition-all ${
              mobileTab === key
                ? `${c.primaryBg} text-white shadow-md`
                : `${c.btnBg} ${c.textMuted}`
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 overflow-hidden min-h-0 relative z-0">
        
        {/* INPUT PANEL */}
        <div
          className={`${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 rounded-[24px] overflow-hidden border transition-all ${c.cardBg} ${c.cardBorder} ${c.cardShadow}`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Panel header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${c.cardBorder}`}>
            <span className={`text-[12px] font-bold uppercase tracking-[0.1em] ${c.textMuted}`}>Input Token</span>
            <div className="flex items-center gap-4">
              <button onClick={handlePaste} className={`flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.05em] transition-colors ${isDark ? 'text-[#0a84ff] hover:text-[#409cff]' : 'text-[#0071e3] hover:text-[#0077ed]'}`}>
                <ClipboardPaste size={14} /> Paste
              </button>
              <span className={`text-[12px] font-medium opacity-70 ${c.textMuted}`}>{token.length} chars</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative flex flex-col">
            <textarea
              ref={textareaRef}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste encrypted Base64 token here…"
              spellCheck={false}
              className={`flex-1 w-full resize-none bg-transparent font-mono text-[14px] leading-relaxed p-6 outline-none pb-24 ${c.text}`}
            />

            {/* Bottom bar */}
            <div className={`absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between backdrop-blur-xl border-t ${isDark ? 'bg-[#1c1c1e]/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
              <span className={`hidden md:block text-[12px] font-medium opacity-70 ${c.textMuted}`}>
                Press <kbd className="font-sans px-1.5 py-0.5 rounded border border-current opacity-70">Ctrl+Enter</kbd>
              </span>
              <button
                onClick={handleDecrypt}
                disabled={loading || !token.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[15px] font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-white ${c.primaryBg} ${c.primaryHover}`}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Decrypting
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Unlock size={16} />
                      Decrypt
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 rounded-[24px] overflow-hidden border transition-all ${c.cardBg} ${c.cardBorder} ${c.cardShadow}`}>
          {/* Panel header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${c.cardBorder}`}>
            <div className="flex items-center gap-3">
              <span className={`text-[12px] font-bold uppercase tracking-[0.1em] ${c.textMuted}`}>Result</span>
              {json && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-md ${isDark ? 'bg-[#2c2c2e] text-[#a1a1a6]' : 'bg-[#f5f5f7] text-[#86868b]'}`}
                >
                  {json.split('\n').length} lines
                </motion.span>
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

          <div className="flex-1 min-h-0 overflow-auto bg-[#fafafa] dark:bg-[#151515]">
            <OutputViewer json={json} isEmpty={!json && !loading} isDark={isDark} />
          </div>
        </div>
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
      className={`p-2 rounded-xl transition-all ${
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
