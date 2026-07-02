import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
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
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  if (!data) return null;

  return (
    <Layout title="Work Orders">
      <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
        <div className="px-4.5 py-3.5 border-b border-gray-200">
          <div className="text-[13px] font-bold text-gray-900">
            All Work Orders ({data.workOrders.length})
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-bold text-gray-700 uppercase tracking-wide">
              <th className="text-left px-4 py-2.5">WO #</th>
              <th className="text-left px-4 py-2.5">Location</th>
              <th className="text-left px-4 py-2.5">Service Type</th>
              <th className="text-left px-4 py-2.5">Not to Exceed</th>
              <th className="text-left px-4 py-2.5">Priority</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Created</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {data.workOrders.map((wo) => (
              <tr key={wo.id} className="border-b border-gray-100 last:border-0 hover:bg-och-teal-light/40">
                <td className="px-4 py-3 font-semibold text-och-teal">{wo.id}</td>
                <td className="px-4 py-3">{wo.location}</td>
                <td className="px-4 py-3">{wo.serviceType}</td>
                <td className="px-4 py-3 font-medium text-[#155724]">{formatCurrency(wo.notToExceed)}</td>
                <td className="px-4 py-3">
                  <Badge kind={priorityBadge[wo.priority]} dot>
                    {priorityLabel[wo.priority]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge kind={statusBadge[wo.status]}>{statusLabel[wo.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(wo.createdDate)}</td>
                <td className="px-4 py-3">
                  {wo.status !== 'completed' && (
                    <button
                      onClick={() => navigate(`/invoices/new?wo=${wo.id}`)}
                      className="text-[11px] font-semibold text-och-teal border border-och-teal/30 rounded-md px-2.5 py-1 hover:bg-och-teal-light"
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
    </Layout>
  );
}
