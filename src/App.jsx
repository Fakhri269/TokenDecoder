import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Copy, Download, Trash2, Settings, Minimize2, Maximize2,
  Lock, ChevronRight, FileJson, Edit3, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { decryptToken } from './utils/crypto';
import OutputViewer from './components/OutputViewer';
import SettingsDrawer from './components/SettingsDrawer';
import Toast from './components/Toast';

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [token, setToken] = useState('');
  const [json, setJson] = useState('');
  const [parsedObj, setParsedObj] = useState(null);
  const [isMinified, setIsMinified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileTab, setMobileTab] = useState('input');
  const [theme, setTheme] = useState(getInitialTheme);

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

  const c = {
    bg:         isDark ? 'bg-[#111111]'   : 'bg-white',
    surface:    isDark ? 'bg-[#1a1a1a]'   : 'bg-[#f7f7f7]',
    border:     isDark ? 'border-[#2a2a2a]' : 'border-[#e8e8e8]',
    textPrimary:isDark ? 'text-[#e8e8e8]' : 'text-[#1a1a1a]',
    textMuted:  isDark ? 'text-[#666]'    : 'text-[#999]',
    hover:      isDark ? 'hover:bg-[#222]' : 'hover:bg-[#f0f0f0]',
  };

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden font-sans ${c.bg} ${c.textPrimary}`}>

      {/* ══ HEADER ══ */}
      <header className={`flex items-center justify-between px-6 h-[56px] border-b shrink-0 ${c.border} ${c.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center ${isDark ? 'bg-[#e8e8e8]' : 'bg-[#1a1a1a]'}`}>
            <Lock size={13} className={isDark ? 'text-[#111]' : 'text-white'} />
          </div>
          <span className={`font-semibold text-[15px] tracking-[-0.3px] ${c.textPrimary}`}>
            Token Decoder
          </span>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${c.textMuted} ${c.hover}`}
        >
          <Settings size={14} />
          <span className="hidden sm:inline">Config</span>
        </button>
      </header>

      {/* ══ MOBILE TABS ══ */}
      <div className={`md:hidden flex shrink-0 border-b ${c.border} ${c.bg}`}>
        {[
          { key: 'input', label: 'Input', icon: <Edit3 size={13} /> },
          { key: 'output', label: 'Result', icon: <FileJson size={13} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 py-2.5 text-[13px] font-medium flex justify-center items-center gap-1.5 border-b-2 transition-colors ${
              mobileTab === key
                ? isDark ? 'border-[#e8e8e8] text-[#e8e8e8]' : 'border-[#1a1a1a] text-[#1a1a1a]'
                : `border-transparent ${c.textMuted}`
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

        {/* INPUT PANEL */}
        <div
          className={`${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 border-r ${c.border}`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Panel label */}
          <div className={`flex items-center justify-between px-5 py-3 border-b ${c.border} ${c.surface}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-widest ${c.textMuted}`}>Input</span>
            <span className={`text-[11px] font-mono ${c.textMuted}`}>{token.length} chars</span>
          </div>

          <div className="flex-1 min-h-0 relative flex flex-col">
            <textarea
              ref={textareaRef}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste encrypted Base64 token here…"
              spellCheck={false}
              className={`flex-1 w-full resize-none bg-transparent font-mono text-[13px] leading-[1.7] p-5 outline-none pb-20 ${c.textPrimary}`}
            />

            {/* Bottom bar */}
            <div className={`absolute bottom-0 left-0 right-0 px-5 py-3.5 flex items-center justify-between border-t ${c.border} ${c.bg}`}>
              <span className={`hidden md:block text-[11px] font-mono ${c.textMuted}`}>
                Ctrl+Enter
              </span>
              <button
                onClick={handleDecrypt}
                disabled={loading || !token.trim()}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-[#e8e8e8] text-[#111] hover:bg-white'
                    : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                }`}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <span className="w-3 h-3 border-[1.5px] border-current border-t-transparent rounded-full animate-spin" />
                      Decrypting
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Unlock size={13} />
                      Decrypt
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0`}>
          {/* Panel label */}
          <div className={`flex items-center justify-between px-5 py-3 border-b ${c.border} ${c.surface} shrink-0`}>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-widest ${c.textMuted}`}>Result</span>
              {json && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-[#2a2a2a] text-[#888]' : 'bg-[#ebebeb] text-[#888]'}`}
                >
                  {json.split('\n').length} lines
                </motion.span>
              )}
            </div>

            {json ? (
              <div className="flex items-center">
                <Btn onClick={handleCopy} title="Copy" isDark={isDark}><Copy size={13} /></Btn>
                <Btn onClick={handleDownload} title="Download" isDark={isDark}><Download size={13} /></Btn>
                <Btn onClick={handleMinify} title={isMinified ? 'Prettify' : 'Minify'} isDark={isDark}>
                  {isMinified ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                </Btn>
                <div className={`w-px h-3.5 mx-1 ${isDark ? 'bg-[#333]' : 'bg-[#ddd]'}`} />
                <Btn onClick={handleClear} title="Clear" isDark={isDark} danger><Trash2 size={13} /></Btn>
              </div>
            ) : <div className="h-6" />}
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
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
      className={`p-1.5 rounded-md transition-colors ${
        danger
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
          : isDark ? 'text-[#555] hover:text-[#ccc] hover:bg-[#222]' : 'text-[#aaa] hover:text-[#333] hover:bg-[#f0f0f0]'
      }`}
    >
      {children}
    </button>
  );
}
