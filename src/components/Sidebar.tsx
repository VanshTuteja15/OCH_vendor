import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardList,
  FileText,
  UserCircle,
  ShieldCheck,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { VENDOR_ACCOUNTS } from '../data/seed';
import { hasExpiredRequiredDoc } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Main' },
  { to: '/work-orders', label: 'Work Orders', icon: ClipboardList, section: 'Main' },
  { to: '/invoices', label: 'Invoices', icon: FileText, section: 'Main' },
  { to: '/profile', label: 'Company Profile', icon: UserCircle, section: 'Profile' },
  { to: '/compliance', label: 'Compliance Docs', icon: ShieldCheck, section: 'Profile' },
  { to: '/access-requests', label: 'Access Requests', icon: Users, section: 'Profile' },
];

export function Sidebar() {
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const vendorData = useAppStore((s) => s.vendorData[currentVendorId]);
  const switchVendor = useAppStore((s) => s.switchVendor);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const account = VENDOR_ACCOUNTS.find((a) => a.vendorId === currentVendorId)!;
  const activeWorkOrders = vendorData?.workOrders.filter((w) => w.status !== 'completed').length ?? 0;
  const expiredDoc = vendorData ? hasExpiredRequiredDoc(vendorData.documents) : false;
  const pendingAccessRequests = vendorData?.accessRequests.filter((r) => r.status === 'pending').length ?? 0;

  let lastSection = '';

  return (
    <div className="w-[220px] bg-och-blue flex flex-col flex-shrink-0">
      <div className="px-[18px] pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-och-teal rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-bold text-white/50 tracking-wide uppercase">
              Ottawa Community Housing
            </div>
            <div className="text-[13px] font-bold text-white">Vendor Portal</div>
          </div>
        </div>
      </div>

      <div className="px-[18px] py-3.5 border-b border-white/[0.08] relative">
        <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Logged in as</div>
        <button
          onClick={() => setSwitcherOpen((v) => !v)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div>
            <div className="text-[13px] font-semibold text-white">{account.vendorName}</div>
            <div className="text-[11px] text-white/40">{account.vendorId} · Active</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70" />
        </button>
        {switcherOpen && (
          <div className="absolute left-[18px] right-[18px] top-full mt-1 bg-white rounded-lg shadow-2xl overflow-hidden z-20">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-3 pt-2.5 pb-1">
              Demo · Switch Vendor
            </div>
            {VENDOR_ACCOUNTS.map((v) => (
              <button
                key={v.vendorId}
                onClick={() => {
                  switchVendor(v.vendorId);
                  setSwitcherOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-och-teal-light transition-colors ${
                  v.vendorId === currentVendorId ? 'text-och-teal font-semibold' : 'text-gray-700'
                }`}
              >
                {v.vendorName}
                <div className="text-[10px] text-gray-400">{v.vendorId}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          const badge =
            item.to === '/work-orders' && activeWorkOrders > 0
              ? String(activeWorkOrders)
              : item.to === '/compliance' && expiredDoc
              ? '!'
              : item.to === '/access-requests' && pendingAccessRequests > 0
              ? String(pendingAccessRequests)
              : null;

          return (
            <div key={item.to}>
              {showSection && (
                <div className="px-[18px] pt-2.5 pb-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {item.section}
                </div>
              )}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-[18px] py-[9px] text-[13px] transition-colors ${
                    isActive
                      ? 'bg-och-teal text-white font-semibold'
                      : 'text-white/65 hover:bg-white/[0.08] hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0 opacity-90" />
                <span>{item.label}</span>
                {badge && (
                  <span className="ml-auto bg-accent text-white text-[10px] font-bold px-1.5 py-[1px] rounded-full">
                    {badge}
                  </span>
                )}
              </NavLink>
            </div>
          );
        })}
      </div>

      <div className="px-[18px] py-3.5 border-t border-white/10">
        <div className="text-[11px] text-white/35">© 2026 Ottawa Community Housing</div>
      </div>
    </div>
  );
}
