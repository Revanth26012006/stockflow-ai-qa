import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warn' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, message?: string, type: ToastType = 'success') => {
    const id = `t_${Date.now()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // Icon and color per toast type
  const config: Record<ToastType, { icon: React.ReactNode; bg: string; color: string }> = {
    success: { icon: <CheckCircle2 size={18} />, bg: '#10b981',  color: '#fff' },
    error:   { icon: <AlertCircle size={18} />,  bg: '#ef4444',  color: '#fff' },
    warn:    { icon: <AlertTriangle size={18} />, bg: '#f59e0b',  color: '#fff' },
    info:    { icon: <Info size={18} />,           bg: '#6366f1',  color: '#fff' },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container – bottom-right corner */}
      <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 380 }}>
        {toasts.map(toast => {
          const { icon, bg, color } = config[toast.type];
          return (
            <div key={toast.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 10, background: bg, color, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'slideUp 0.25s ease' }}>
              <div style={{ marginTop: 2 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{toast.title}</div>
                {toast.message && <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: 2 }}>{toast.message}</div>}
              </div>
              <button onClick={() => dismiss(toast.id)} style={{ background: 'none', border: 'none', color, cursor: 'pointer', opacity: 0.75, lineHeight: 1 }}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
