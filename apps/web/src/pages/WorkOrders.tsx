import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageIntro, SectionHeader } from '../components/ProductUI';
import { useVendorSummary } from '../api/hooks';
import { formatCurrency, formatDate } from '../lib/utils';

const priorityBadge = { high: 'danger', medium: 'warn', low: 'gray' } as const;
const priorityLabel = { high: 'High', medium: 'Medium', low: 'Low' } as const;
const statusBadge = { onsite: 'info', scheduled: 'teal', pending: 'gray', completed: 'success' } as const;
const statusLabel = {
  onsite: 'Onsite',
  scheduled: 'Scheduled',
  pending: 'Pending',
  completed: 'Completed',
} as const;

export function WorkOrders() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useVendorSummary();

  if (isLoading) {
    return (
      <Layout title="Work Orders">
        <LoadingState />
      </Layout>
    );
  }
  if (isError || !data) {
    return (
      <Layout title="Work Orders">
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load work orders.'} />
      </Layout>
    );
  }

  return (
    <Layout title="Work Orders">
      <PageIntro
        eyebrow="Service operations"
        title="Work orders"
        description="Track active service requests, priorities, approved limits, and invoice readiness in one place."
      />
      <div className="product-card">
        <SectionHeader
          title={`All work orders (${data.workOrders.length})`}
          description="Live service activity assigned to your vendor account"
        />
        <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>WO #</th>
              <th>Location</th>
              <th>Service Type</th>
              <th>Not to Exceed</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {data.workOrders.map((wo) => (
              <tr key={wo.id}>
                <td className="font-bold text-och-teal">{wo.id}</td>
                <td className="font-medium text-slate-800">{wo.location}</td>
                <td>{wo.serviceType}</td>
                <td className="font-semibold text-och-blue">{formatCurrency(wo.notToExceed)}</td>
                <td>
                  <Badge kind={priorityBadge[wo.priority]} dot>
                    {priorityLabel[wo.priority]}
                  </Badge>
                </td>
                <td>
                  <Badge kind={statusBadge[wo.status]}>{statusLabel[wo.status]}</Badge>
                </td>
                <td className="text-slate-500">{formatDate(wo.createdDate)}</td>
                <td>
                  {wo.status !== 'completed' && (
                    <button
                      onClick={() => navigate(`/invoices/new?wo=${wo.id}`)}
                      className="btn-secondary !px-3 !py-1.5 !text-[11px]"
                    >
                      Submit Invoice
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </Layout>
  );
}
