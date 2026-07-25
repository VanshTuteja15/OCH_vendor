import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => clearToast(), 3200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const styles = {
    success: 'bg-[#1a3a5c] border-och-teal',
    error: 'bg-[#7b1a13] border-[#f5c6cb]',
    info: 'bg-[#1a3a5c] border-och-sky',
  }[toast.kind];

  const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? XCircle : Info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[fadeIn_0.2s_ease]">
      <div
        className={`text-white text-sm font-medium rounded-lg shadow-2xl border-l-4 px-4 py-3 flex items-center gap-2.5 max-w-sm ${styles}`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {toast.message}
      </div>
    </div>
  );
}
