import type { ReactNode } from 'react';
import { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useVendorSummary } from '../api/hooks';
import { hasExpiredRequiredDoc } from '../lib/utils';

export function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  const { data } = useVendorSummary();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);

  const expiredDoc = data ? hasExpiredRequiredDoc(data.documents) : false;

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 flex items-center px-4 sm:px-6 lg:px-8 gap-4 flex-shrink-0">
      <div className="flex-1">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-och-teal">OCH Vendor Portal</div>
        <div className="font-display text-[15px] font-bold text-och-blue">{title}</div>
      </div>
      {actions}
      {expiredDoc && (
        <span className="bg-[#fff3cd] text-[#856404] text-[11px] font-semibold px-2.5 py-[3px] rounded-full border border-[#ffc107]">
          ⚠ 1 Compliance Issue
        </span>
      )}
      <div className="relative">
        <button aria-label="Notifications" className="rounded-lg p-2 text-slate-500 transition hover:bg-och-teal-light hover:text-och-teal">
          <Bell className="w-4.5 h-4.5" />
        </button>
        {expiredDoc && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white" />
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 bg-gradient-to-br from-och-teal to-och-teal-dark rounded-xl shadow-sm flex items-center justify-center text-xs font-bold text-white ring-2 ring-och-teal-light"
        >
          {data?.initials ?? '—'}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-20 w-56">
            <div className="px-3.5 py-2.5 border-b border-gray-100">
              <div className="text-xs font-semibold text-gray-900">
                {data?.vendorName ?? 'Vendor'}
              </div>
              <div className="text-[11px] text-gray-400">{data?.profile.email ?? ''}</div>
            </div>
            <button
              onClick={() => signOut({ redirectUrl: '/login' })}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
