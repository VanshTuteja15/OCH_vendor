import { useNavigate } from 'react-router-dom';
import { Plus, Lock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageIntro, SectionHeader } from '../components/ProductUI';
import { useVendorSummary } from '../api/hooks';
import { formatCurrency, formatDate, hasExpiredRequiredDoc } from '../lib/utils';

const statusBadge = { pending: 'warn', approved: 'info', paid: 'success', rejected: 'danger' } as const;
const statusLabel = { pending: 'Pending', approved: 'Approved', paid: 'Paid', rejected: 'Rejected' } as const;

export function Invoices() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useVendorSummary();

  if (isLoading) {
    return (
      <Layout title="Invoices">
        <LoadingState />
      </Layout>
    );
  }
  if (isError || !data) {
    return (
      <Layout title="Invoices">
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load invoices.'} />
      </Layout>
    );
  }

  const blocked = hasExpiredRequiredDoc(data.documents);

  return (
    <Layout title="Invoices">
      <PageIntro
        eyebrow="Billing"
        title="Invoices"
        description="Review payment status, totals, and the work order linked to every submission."
        actions={
        <button
          onClick={() => !blocked && navigate('/invoices/new')}
          disabled={blocked}
          className="btn-primary"
        >
          {blocked ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          New Invoice
        </button>
        }
      />
      {blocked && (
        <Alert kind="danger">
          <strong>Invoice submission is blocked.</strong> Renew your expired compliance document
          before submitting a new invoice.{' '}
          <button onClick={() => navigate('/compliance')} className="font-bold underline underline-offset-2">
            Go to Compliance Docs →
          </button>
        </Alert>
      )}

      <div className="product-card">
        <SectionHeader
          title={`All invoices (${data.invoices.length})`}
          description="Amounts are shown in CAD and update from the OCH review workflow"
        />
        <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Work Order</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-bold text-och-teal">{inv.invoiceNumber}</td>
                <td className="font-medium text-slate-700">{inv.workOrderId}</td>
                <td className="text-slate-500">{formatDate(inv.invoiceDate)}</td>
                <td className="font-bold text-och-blue">{formatCurrency(inv.total)}</td>
                <td>
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
      </div>
    </Layout>
  );
}
