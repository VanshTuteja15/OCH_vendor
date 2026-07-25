import type { ReactNode } from 'react';

type BadgeKind = 'success' | 'danger' | 'warn' | 'info' | 'gray' | 'teal';

const styles: Record<BadgeKind, string> = {
  success: 'bg-[#d4edda] text-[#155724]',
  danger: 'bg-[#f8d7da] text-[#721c24]',
  warn: 'bg-[#fff3cd] text-[#856404]',
  info: 'bg-[#cce5ff] text-[#004085]',
  gray: 'bg-gray-200 text-gray-700',
  teal: 'bg-och-teal-light text-och-teal-dark',
};

export function Badge({
  kind,
  children,
  dot = false,
}: {
  kind: BadgeKind;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-[3px] rounded-full uppercase tracking-wide ${styles[kind]}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
