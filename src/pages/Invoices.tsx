import { useNavigate } from 'react-router-dom';
import { Plus, Lock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, formatDate, hasExpiredRequiredDoc } from '../lib/utils';

const statusBadge = { pending: 'warn', approved: 'info', paid: 'success', rejected: 'danger' } as const;
const statusLabel = { pending: 'Pending', approved: 'Approved', paid: 'Paid', rejected: 'Rejected' } as const;

export function Invoices() {
  const navigate = useNavigate();
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  if (!data) return null;

  const blocked = hasExpiredRequiredDoc(data.documents);

  return (
    <Layout
      title="Invoices"
      actions={
        <button
          onClick={() => !blocked && navigate('/invoices/new')}
          disabled={blocked}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-md transition-colors ${
            blocked
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-och-teal hover:bg-och-teal-dark text-white'
          }`}
        >
          {blocked ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          New Invoice
        </button>
      }
    >
      {blocked && (
        <Alert kind="danger">
          <strong>Invoice submission is blocked.</strong> Renew your expired compliance document
          before submitting a new invoice.{' '}
          <button onClick={() => navigate('/compliance')} className="font-bold underline underline-offset-2">
            Go to Compliance Docs →
          </button>
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
        <div className="px-4.5 py-3.5 border-b border-gray-200">
          <div className="text-[13px] font-bold text-gray-900">All Invoices ({data.invoices.length})</div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">Invoice #</th>
              <th className="text-left px-4 py-2.5">Work Order</th>
              <th className="text-left px-4 py-2.5">Date</th>
              <th className="text-left px-4 py-2.5">Total</th>
              <th className="text-left px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100 last:border-0 hover:bg-och-teal-light/40">
                <td className="px-4 py-3 font-semibold text-och-teal">{inv.invoiceNumber}</td>
                <td className="px-4 py-3">{inv.workOrderId}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(inv.invoiceDate)}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(inv.total)}</td>
                <td className="px-4 py-3">
                  <Badge kind={statusBadge[inv.status]}>{statusLabel[inv.status]}</Badge>
                </td>
              </tr>
            ))}
            {data.invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No invoices submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
