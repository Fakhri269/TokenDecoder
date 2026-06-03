import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

const CORRECT_PIN = '789012';

export default function PinScreen({ onUnlock, addToast }) {
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #12121f 50%, #0a0a14 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Background blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '15%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <motion.div
        animate={shake ? { x: [-10, 10, -10, 10, -6, 6, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 340,
          margin: '0 16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 28,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: '40px 32px 36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
          }}>
            <Lock size={22} color="white" />
          </div>
          <h1 style={{
            color: '#f1f1f5', fontSize: 22, fontWeight: 700,
            letterSpacing: '-0.5px', margin: 0, marginBottom: 6,
          }}>
            Token Forge
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0,
            textAlign: 'center',
          }}>
            Enter your PIN to continue
          </p>
        </div>

        {/* PIN Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          {[0,1,2,3,4,5].map(i => {
            const filled = i < pin.length;
            const isError = error;
            return (
              <motion.div
                key={i}
                animate={filled ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: filled
                    ? isError
                      ? 'linear-gradient(135deg, #ef4444, #f87171)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(255,255,255,0.12)',
                  border: filled ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.15s ease',
                  boxShadow: filled && !isError ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {keys.flat().map((k, idx) => {
            if (k === null) return <div key={idx} />;
            if (k === 'del') return (
              <motion.button
                key="del"
                whileTap={{ scale: 0.88 }}
                onClick={handleDelete}
                style={{
                  height: 60, borderRadius: 14, border: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <Delete size={18} />
              </motion.button>
            );
            return (
              <motion.button
                key={k}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleKey(k)}
                style={{
                  height: 60, borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#e8e8ef',
                  fontSize: 20, fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                  e.currentTarget.style.color = '#a5b4fc';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.color = '#e8e8ef';
                }}
              >
                {k}
              </motion.button>
            );
          })}
        </div>

        {/* Error hint */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', color: '#f87171', fontSize: 12,
                marginTop: 20, marginBottom: 0,
              }}
            >
              Wrong PIN. Please try again.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Watermark */}
        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.15)',
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          marginTop: error ? 12 : 28, marginBottom: 0,
        }}>
          Token Forge — Created by Fakhri
        </p>
      </motion.div>
    </div>
  );
}
