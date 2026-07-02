import { Users, Check, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/utils';

const statusBadge = { pending: 'warn', approved: 'success', denied: 'danger' } as const;

export function AccessRequests() {
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  const respondAccessRequest = useAppStore((s) => s.respondAccessRequest);
  const showToast = useAppStore((s) => s.showToast);

  if (!data) return null;

  return (
    <Layout title="Access Requests">
      <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
        <div className="px-4.5 py-3.5 border-b border-gray-200">
          <div className="text-[13px] font-bold text-gray-900">Team Access Requests</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Approve or deny requests from team members who want access to this vendor account.
          </div>
        </div>
        <div className="p-4.5">
          {data.accessRequests.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <div className="text-sm text-gray-500">No access requests at this time.</div>
            </div>
          ) : (
            data.accessRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="w-8 h-8 bg-och-teal-light rounded-full flex items-center justify-center text-[11px] font-bold text-och-teal flex-shrink-0">
                  {req.requestedBy
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-900">{req.requestedBy}</div>
                  <div className="text-[11px] text-gray-400">
                    {req.role} · Requested {formatDate(req.requestedDate)}
                  </div>
                </div>
                {req.status === 'pending' ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        respondAccessRequest(req.id, 'approved');
                        showToast(`${req.requestedBy}'s access approved.`, 'success');
                      }}
                      className="flex items-center gap-1 bg-och-teal hover:bg-och-teal-dark text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        respondAccessRequest(req.id, 'denied');
                        showToast(`${req.requestedBy}'s access denied.`, 'info');
                      }}
                      className="flex items-center gap-1 border border-gray-300 text-gray-700 text-[11px] font-semibold px-2.5 py-1.5 rounded-md hover:bg-gray-50"
                    >
                      <X className="w-3 h-3" /> Deny
                    </button>
                  </div>
                ) : (
                  <Badge kind={statusBadge[req.status]}>{req.status}</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
