import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Copy, Download, Trash2, Settings, Minimize2, Maximize2,
  Lock, ChevronRight, FileJson, Edit3
} from 'lucide-react';
import { decryptToken } from './utils/crypto';
import OutputViewer from './components/OutputViewer';
import SettingsDrawer from './components/SettingsDrawer';
import Toast from './components/Toast';

export default function App() {
  const [token, setToken] = useState('');
  const [json, setJson] = useState('');
  const [parsedObj, setParsedObj] = useState(null);
  const [isMinified, setIsMinified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [mobileTab, setMobileTab] = useState('input'); // 'input' or 'output'
  
  const [settings, setSettings] = useState({
    key: 'YourSuperSecretKeyForExamOnLan13',
    iv: 'YourSuperSecretI',
  });
  const textareaRef = useRef(null);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleDecrypt = useCallback(async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      addToast('Input is empty.', 'error');
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    setJson('');
    setParsedObj(null);
    setIsMinified(false);

    try {
      const plain = await decryptToken(trimmed, settings.key, settings.iv);
      const obj = JSON.parse(plain);
      setParsedObj(obj);
      setJson(JSON.stringify(obj, null, 2));
      addToast('Decrypted successfully.');
      setMobileTab('output'); // Auto-switch to output on mobile
    } catch (err) {
      addToast('Decryption failed. Check your config.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, settings, addToast]);

  const handleCopy = useCallback(async () => {
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      const t = document.createElement('textarea');
      t.value = json;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    addToast('Copied to clipboard.');
  }, [json, addToast]);

  const handleDownload = useCallback(() => {
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decoded-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded successfully.');
  }, [json, addToast]);

  const handleMinify = useCallback(() => {
    if (!parsedObj) return;
    const next = !isMinified;
    setIsMinified(next);
    setJson(next ? JSON.stringify(parsedObj) : JSON.stringify(parsedObj, null, 2));
  }, [parsedObj, isMinified]);

  const handleClear = useCallback(() => {
    setToken('');
    setJson('');
    setParsedObj(null);
    setIsMinified(false);
    setMobileTab('input');
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleDecrypt();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDecrypt]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setToken(reader.result);
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-white text-gray-900 font-sans selection:bg-gray-200">
      
      {/* ═══ HEADER ═══ */}
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-gray-200 shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
            <Lock size={14} className="text-gray-700" />
          </div>
          <span className="font-semibold text-sm md:text-base tracking-tight text-gray-900">
            Token Decoder
          </span>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <Settings size={14} /> <span className="hidden sm:inline">Config</span>
        </button>
      </header>

      {/* ═══ MOBILE TABS ═══ */}
      <div className="md:hidden flex border-b border-gray-200 bg-gray-50/50 shrink-0">
        <button
          onClick={() => setMobileTab('input')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors ${
            mobileTab === 'input' 
              ? 'border-gray-900 text-gray-900 bg-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Edit3 size={16} /> Input
        </button>
        <button
          onClick={() => setMobileTab('output')}
          className={`flex-1 py-3 text-sm font-medium border-b-2 flex justify-center items-center gap-2 transition-colors ${
            mobileTab === 'output' 
              ? 'border-gray-900 text-gray-900 bg-white' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileJson size={16} /> Result
        </button>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-white">
        
        {/* INPUT PANE */}
        <div
          className={`${mobileTab === 'input' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 border-r-0 md:border-r border-gray-200 bg-white`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="hidden md:flex px-6 py-3 border-b border-gray-100 justify-between items-center bg-gray-50/50">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Input Payload</h2>
            <span className="text-xs text-gray-400 font-mono">{token.length} chars</span>
          </div>
          
          <div className="flex-1 min-h-0 p-4 md:p-6 flex flex-col relative">
            <textarea
              ref={textareaRef}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste encrypted Base64 token here..."
              spellCheck={false}
              className="flex-1 w-full resize-none bg-transparent font-mono text-sm md:text-[13px] text-gray-700 outline-none leading-relaxed placeholder:text-gray-300 pb-16 md:pb-0"
            />
            
            {/* Action Bar (Mobile floating at bottom, Desktop floating absolute) */}
            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 left-4 md:left-auto flex justify-between md:justify-end items-center pointer-events-none">
              <span className="md:hidden text-xs text-gray-400 font-mono pointer-events-auto bg-white/80 px-2 py-1 rounded backdrop-blur">
                {token.length} chars
              </span>
              <button
                onClick={handleDecrypt}
                disabled={loading || !token.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md pointer-events-auto"
              >
                {loading ? 'Decrypting...' : 'Decrypt'}
                {!loading && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT PANE */}
        <div className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-h-0 bg-white`}>
          <div className="px-4 md:px-6 py-2 md:py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
            <h2 className="hidden md:flex text-xs font-semibold uppercase tracking-wider text-gray-500 items-center gap-2">
              <FileJson size={14} /> Result
            </h2>
            
            {/* Desktop spacer when title is hidden */}
            <div className="md:hidden"></div>
            
            {json && (
              <div className="flex items-center gap-1">
                <ActionButton onClick={handleCopy} icon={<Copy size={16} mdSize={14} />} title="Copy" />
                <ActionButton onClick={handleDownload} icon={<Download size={16} mdSize={14} />} title="Download" />
                <ActionButton onClick={handleMinify} icon={isMinified ? <Maximize2 size={16} mdSize={14} /> : <Minimize2 size={16} mdSize={14} />} title={isMinified ? "Prettify" : "Minify"} />
                <div className="w-px h-5 md:h-4 bg-gray-200 mx-1 md:mx-2" />
                <ActionButton onClick={handleClear} icon={<Trash2 size={16} mdSize={14} />} title="Clear" danger />
              </div>
            )}
            {!json && <div className="h-8 md:h-7" />} {/* Empty placeholder to maintain height */}
          </div>
          
          <div className="flex-1 min-h-0 overflow-auto bg-white">
            <OutputViewer json={json} isEmpty={!json && !loading} />
          </div>
        </div>

      </div>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={(s) => {
          setSettings(s);
          setSettingsOpen(false);
          addToast('Settings saved.');
        }}
      />
      <Toast toasts={toasts} />
    </div>
  );
}

// Custom ActionButton to handle different icon sizes for mobile/desktop
function ActionButton({ onClick, icon, danger, title }) {
  return (
    <button 
      onClick={onClick} 
      title={title}
      className={`p-2 md:p-1.5 rounded-md transition-colors ${
        danger 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
    </button>
  );
}
