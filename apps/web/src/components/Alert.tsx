import type { ReactNode } from 'react';
import { AlertTriangle, TriangleAlert } from 'lucide-react';

export function Alert({
  kind,
  children,
}: {
  kind: 'danger' | 'warn';
  children: ReactNode;
}) {
  const isDanger = kind === 'danger';
  return (
    <div
      className={`rounded-lg px-3.5 py-2.5 text-xs flex items-center gap-2.5 mb-3.5 ${
        isDanger
          ? 'bg-[#fdecea] border border-[#f5c6cb] text-[#7b1a13]'
          : 'bg-[#fff8e1] border border-[#ffe082] text-[#6d4c00]'
      }`}
    >
      {isDanger ? (
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <TriangleAlert className="w-4 h-4 flex-shrink-0" />
      )}
      <div>{children}</div>
    </div>
  );
}
