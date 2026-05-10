import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const toast = useCallback(({ message, type = 'success', duration = 2800 }) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    // Begin exit animation before removing
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    }, duration - 350);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`mk-toast mk-toast-${t.type}${t.exiting ? ' exiting' : ''}`}
            role="status"
          >
            <span className="mk-toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '↗'}
            </span>
            <span className="mk-toast-msg">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
