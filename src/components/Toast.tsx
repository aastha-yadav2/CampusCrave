import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-50 flex items-center justify-between gap-3 bg-charcoal-900 text-white px-4 py-3 rounded-xl shadow-xl border border-charcoal-700 max-w-md animate-slide-up">
      <div className="flex items-center gap-3">
        {toast.type === 'info' ? (
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
        ) : toast.type === 'warning' ? (
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        )}
        <div className="text-sm">
          {toast.title && <div className="font-semibold text-white">{toast.title}</div>}
          <div className="text-stone-300 text-xs leading-relaxed">{toast.message}</div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
