// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, Info, XCircle, X } from 'lucide-react';

const stylesByType = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    border: 'border-emerald-400/30',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    border: 'border-red-400/30',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-400" />,
    border: 'border-blue-400/30',
  },
};

export default function Toast({ open, message, type = 'success', onClose }) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const style = stylesByType[type] ?? stylesByType.success;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[9999] md:inset-x-auto md:right-8 md:bottom-8 flex justify-center md:justify-end pointer-events-none">
      <div
        className={`
          pointer-events-auto flex items-start gap-3 rounded-2xl border
          ${style.border} bg-zinc-900/90 backdrop-blur-xl px-4 py-3 shadow-glow
          w-full max-w-[20rem] animate-toast-slide-up
        `}
      >
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>

        <div className="text-sm text-zinc-100">
          <p className="font-semibold tracking-wide uppercase text-[11px] text-zinc-300">
            {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice'}
          </p>
          <p className="mt-0.5 leading-snug">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="ml-auto mt-0.5 text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}