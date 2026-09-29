import React from 'react';
import { CheckCircle2, Info, RotateCcw, X, AlertCircle } from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDiscovery();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#0f141f] border border-zinc-700/90 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'undo' ? (
              <span className="p-1 rounded-md bg-zinc-800 text-zinc-300">
                <RotateCcw className="w-4 h-4" />
              </span>
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs text-zinc-200 font-medium truncate">
              {toast.message}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction?.();
                  removeToast(toast.id);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] transition-colors"
              >
                Undo
              </button>
            )}

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
