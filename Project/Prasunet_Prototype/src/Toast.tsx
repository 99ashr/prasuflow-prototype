import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '@/store';

export function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => {
        const icon =
          t.tone === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
          t.tone === 'error' ? <AlertCircle size={16} className="text-rose-500" /> :
          <Info size={16} className="text-blue-500" />;
        const border =
          t.tone === 'success' ? 'border-emerald-200' :
          t.tone === 'error' ? 'border-rose-200' :
          'border-blue-200';
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border ${border} bg-white px-4 py-3 shadow-lg shadow-slate-900/10 animate-[slideup_0.2s_ease-out]`}
          >
            {icon}
            <span className="text-xs font-semibold text-slate-700">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
