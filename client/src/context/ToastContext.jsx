import { createContext, useContext, useCallback } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  // Toasts disabled — function is a no-op
  const toast = useCallback(() => {}, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
