import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { ToastContext, type ToastVariant } from './toastContext';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success', durationMs = 3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(current => [...current, { id, message, variant, durationMs }]);

    window.setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-3 p-4">
        {toasts.map(toast => (
          <div key={toast.id} className="toast toast-end pointer-events-auto">
            <div className={`alert shadow-lg ${toast.variant === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
