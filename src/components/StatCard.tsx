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
    <div className="bg-white rounded-lg border border-gray-200 p-3.5 flex items-center gap-3.5 shadow-card-sm">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[11px] text-gray-700 mb-0.5">{label}</div>
        <div className="text-[22px] font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
