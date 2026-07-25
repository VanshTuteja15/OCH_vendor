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
    <div className="h-[54px] bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="text-[15px] font-bold text-gray-900 flex-1">{title}</div>
      {actions}
      {expiredDoc && (
        <span className="bg-[#fff3cd] text-[#856404] text-[11px] font-semibold px-2.5 py-[3px] rounded-full border border-[#ffc107]">
          ⚠ 1 Compliance Issue
        </span>
      )}
      <div className="relative">
        <Bell className="w-5 h-5 text-gray-700 cursor-pointer" />
        {expiredDoc && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full border-2 border-white" />
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 bg-och-teal rounded-full flex items-center justify-center text-xs font-bold text-white"
        >
          {data?.initials ?? '—'}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-20 w-44">
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
    </div>
  );
}
