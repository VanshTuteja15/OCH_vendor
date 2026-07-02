import { useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { StatCard } from '../components/StatCard';
import { ComplianceRing } from '../components/ComplianceRing';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import {
  complianceScore,
  docStatus,
  formatCurrency,
  hasExpiredRequiredDoc,
} from '../lib/utils';

const priorityBadge = { high: 'danger', medium: 'warn', low: 'gray' } as const;
const priorityLabel = { high: 'High', medium: 'Medium', low: 'Low' } as const;
const statusBadge = { onsite: 'info', scheduled: 'teal', pending: 'gray', completed: 'success' } as const;
const statusLabel = {
  onsite: 'Onsite',
  scheduled: 'Scheduled',
  pending: 'Pending',
  completed: 'Completed',
} as const;

export function Dashboard() {
  const navigate = useNavigate();
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  if (!data) return null;

  const activeWorkOrders = data.workOrders.filter((w) => w.status !== 'completed');
  const highPriorityCount = activeWorkOrders.filter((w) => w.priority === 'high').length;
  const pendingInvoices = data.invoices.filter((i) => i.status === 'pending');
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  const now = new Date();
  const paidThisMonth = data.invoices.filter((i) => {
    if (i.status !== 'paid') return false;
    const d = new Date(i.submittedDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const paidTotal = paidThisMonth.reduce((sum, i) => sum + i.total, 0);

  const score = complianceScore(data.documents);
  const expired = hasExpiredRequiredDoc(data.documents);
  const expiredDoc = data.documents.find((d) => d.required && docStatus(d) === 'expired');

  return (
    <Layout title="Dashboard">
      {expired && expiredDoc && (
        <Alert kind="danger">
          <strong>Action Required:</strong> Your {expiredDoc.name} expired on{' '}
          {new Date(expiredDoc.expiryDate).toLocaleDateString('en-CA', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          . Invoice submission is blocked until renewed.{' '}
          <button
            onClick={() => navigate('/compliance')}
            className="font-bold underline underline-offset-2"
          >
            Upload now →
          </button>
        </Alert>
      )}

      <div className="grid grid-cols-4 gap-3.5 mb-4.5">
        <StatCard
          icon={<ClipboardList className="w-5 h-5 text-och-teal" />}
          iconBg="#e6f4f3"
          label="Active Work Orders"
          value={String(activeWorkOrders.length)}
          sub={`${highPriorityCount} high priority`}
        />
        <StatCard
          icon={<FileText className="w-5 h-5 text-[#856404]" />}
          iconBg="#fff3cd"
          label="Pending Invoices"
          value={String(pendingInvoices.length)}
          sub={formatCurrency(pendingTotal) + ' total'}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-[#155724]" />}
          iconBg="#d4edda"
          label="Paid This Month"
          value={formatCurrency(paidTotal)}
          sub={`${paidThisMonth.length} invoice${paidThisMonth.length === 1 ? '' : 's'}`}
        />
        <StatCard
          icon={<ShieldAlert className="w-5 h-5 text-[#721c24]" />}
          iconBg="#f8d7da"
          label="Compliance Score"
          value={`${score}%`}
          sub={expired ? 'Document expired' : score < 100 ? 'Expiring soon' : 'All valid'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
          <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-center justify-between">
            <div className="text-[13px] font-bold text-gray-900">Active Work Orders</div>
            <button
              onClick={() => navigate('/work-orders')}
              className="text-[11px] font-semibold border border-gray-300 rounded-md px-2.5 py-1 hover:bg-gray-50"
            >
              View All
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                <th className="text-left px-3 py-2">WO #</th>
                <th className="text-left px-3 py-2">Location</th>
                <th className="text-left px-3 py-2">Priority</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeWorkOrders.map((wo) => (
                <tr key={wo.id} className="border-b border-gray-100 last:border-0 hover:bg-och-teal-light/40">
                  <td className="px-3 py-2.5 font-semibold text-och-teal">{wo.id}</td>
                  <td className="px-3 py-2.5">{wo.location}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={priorityBadge[wo.priority]} dot>
                      {priorityLabel[wo.priority]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge kind={statusBadge[wo.status]}>{statusLabel[wo.status]}</Badge>
                  </td>
                </tr>
              ))}
              {activeWorkOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                    No active work orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
          <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-center justify-between">
            <div className="text-[13px] font-bold text-gray-900">Compliance Overview</div>
            <button
              onClick={() => navigate('/compliance')}
              className="text-[11px] font-semibold border border-gray-300 rounded-md px-2.5 py-1 hover:bg-gray-50"
            >
              Manage Docs
            </button>
          </div>
          <div className="p-4.5">
            <div className="flex items-center gap-5">
              <ComplianceRing score={score} />
              <div className="flex-1">
                <div className="text-[13px] font-bold text-gray-900 mb-2">Document Status</div>
                {data.documents.map((doc) => {
                  const status = docStatus(doc);
                  const color =
                    status === 'valid' ? '#27ae60' : status === 'expiring' ? '#e67e22' : '#c0392b';
                  return (
                    <div key={doc.id} className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      {doc.name} ·{' '}
                      <strong style={{ color: status !== 'valid' ? color : undefined }}>
                        {status === 'valid' ? 'Valid' : status === 'expiring' ? 'Expiring soon' : 'EXPIRED'}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
