import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardList,
  FileText,
  UserCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useVendorSummary } from '../api/hooks';
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
  const { data } = useVendorSummary();

  const activeWorkOrders = data?.workOrders.filter((w) => w.status !== 'completed').length ?? 0;
  const expiredDoc = data ? hasExpiredRequiredDoc(data.documents) : false;
  const pendingAccessRequests =
    data?.accessRequests.filter((r) => r.status === 'pending').length ?? 0;

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

      <div className="px-[18px] py-3.5 border-b border-white/[0.08]">
        <div className="text-[10px] text-white/40 uppercase tracking-wide mb-1">Logged in as</div>
        <div className="text-[13px] font-semibold text-white">
          {data?.vendorName ?? 'Loading…'}
        </div>
        <div className="text-[11px] text-white/40">
          {data?.vendorId ?? '—'} · {data?.status ?? 'Active'}
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          const Icon = item.icon;
          const badge =
            item.to === '/work-orders' && activeWorkOrders > 0
              ? activeWorkOrders
              : item.to === '/compliance' && expiredDoc
                ? '!'
                : item.to === '/access-requests' && pendingAccessRequests > 0
                  ? pendingAccessRequests
                  : null;

          return (
            <div key={item.to}>
              {showSection && (
                <div className="text-[10px] font-bold text-white/35 uppercase tracking-wide px-2.5 pt-3 pb-1.5">
                  {item.section}
                </div>
              )}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] mb-0.5 transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/65 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge !== null && (
                  <span
                    className={`text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ${
                      badge === '!'
                        ? 'bg-danger text-white'
                        : 'bg-och-teal text-white'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
