import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function updateToasts(toasts: Toast[]) {
  currentToasts = toasts;
  toastListeners.forEach(l => l(toasts));
}

export function addToast(message: string, type: Toast['type'] = 'success') {
  const id = `toast_${Date.now()}`;
  const newToast: Toast = { id, message, type };
  updateToasts([...currentToasts, newToast]);
  setTimeout(() => {
    updateToasts(currentToasts.filter(t => t.id !== id));
  }, 3000);
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter(l => l !== setToasts);
    };
  }, []);

  return { toasts, subscribe };
}

export function ToastContainer() {
  const { toasts, subscribe } = useToasts();
  
  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && '✓ '}
          {t.type === 'error' && '✕ '}
          {t.type === 'info' && 'ℹ '}
          {t.message}
        </div>
      ))}
    </div>
  );
}
