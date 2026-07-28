import type { ReactNode } from 'react';

export function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center gap-4 shadow-[0_8px_24px_rgba(26,58,92,0.06)] transition hover:-translate-y-0.5 hover:border-och-teal/20 hover:shadow-[0_12px_30px_rgba(26,58,92,0.1)]">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-och-teal to-och-sky opacity-70" />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-black/[0.03]"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-1">{label}</div>
        <div className="font-display text-[22px] font-bold text-och-blue leading-none">{value}</div>
        <div className="text-[10px] text-slate-400 mt-1.5">{sub}</div>
      </div>
    </div>
  );
}
