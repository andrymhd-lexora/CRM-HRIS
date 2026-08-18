import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Clock, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    // Give warning/due soon toasts slightly more time so user can read details
    const duration = toast.type === 'warning' ? 6000 : 3500;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.type, onDismiss]);

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-100',
    error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/80 dark:border-red-800 dark:text-red-100',
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-100',
    warning: 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/90 dark:border-amber-700 dark:text-amber-100 shadow-amber-500/10'
  }[toast.type];

  const icon = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    warning: <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bgStyles}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="text-xs font-semibold leading-snug">{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
