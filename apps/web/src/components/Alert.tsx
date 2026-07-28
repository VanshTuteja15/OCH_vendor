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
      className={`rounded-xl px-4 py-3 text-xs leading-5 flex items-start gap-3 shadow-sm ${
        isDanger
          ? 'bg-red-50 border border-red-200 text-red-900'
          : 'bg-amber-50 border border-amber-200 text-amber-900'
      }`}
    >
      {isDanger ? (
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      ) : (
        <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
      )}
      <div>{children}</div>
    </div>
  );
}
