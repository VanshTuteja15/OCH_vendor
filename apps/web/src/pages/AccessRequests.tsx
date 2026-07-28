import { Users, Check, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageIntro, SectionHeader } from '../components/ProductUI';
import { useRespondAccessRequest, useVendorSummary } from '../api/hooks';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/utils';

const statusBadge = { pending: 'warn', approved: 'success', denied: 'danger' } as const;

export function AccessRequests() {
  const { data, isLoading, isError, error } = useVendorSummary();
  const respond = useRespondAccessRequest();
  const showToast = useAppStore((s) => s.showToast);

  if (isLoading) {
    return (
      <Layout title="Access Requests">
        <LoadingState />
      </Layout>
    );
  }
  if (isError || !data) {
    return (
      <Layout title="Access Requests">
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load access requests.'}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Access Requests">
      <PageIntro
        eyebrow="Account security"
        title="Access requests"
        description="Control who can view vendor information and submit work on behalf of your organization."
      />
      <div className="product-card">
        <SectionHeader
          title="Team access requests"
          description="Approve only people you recognize from your organization"
          trailing={<Badge kind="teal">{data.accessRequests.length} total</Badge>}
        />
        <div className="p-5">
          {data.accessRequests.length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <div className="text-sm text-gray-500">No access requests at this time.</div>
            </div>
          ) : (
            data.accessRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 mb-3 last:mb-0 transition hover:border-och-teal/20 hover:bg-och-teal-light/20">
                <div className="w-11 h-11 bg-gradient-to-br from-och-teal-light to-white border border-och-teal/15 rounded-xl flex items-center justify-center text-xs font-bold text-och-teal flex-shrink-0 shadow-sm">
                  {req.requestedBy
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-och-blue">{req.requestedBy}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {req.role} · Requested {formatDate(req.requestedDate)}
                  </div>
                </div>
                {req.status === 'pending' ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        respond.mutate(
                          { id: req.id, status: 'approved' },
                          {
                            onSuccess: () =>
                              showToast(`${req.requestedBy}'s access approved.`, 'success'),
                            onError: () => showToast('Failed to update request.', 'error'),
                          }
                        );
                      }}
                      className="btn-primary !px-3 !py-2 !text-[11px]"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        respond.mutate(
                          { id: req.id, status: 'denied' },
                          {
                            onSuccess: () =>
                              showToast(`${req.requestedBy}'s access denied.`, 'info'),
                            onError: () => showToast('Failed to update request.', 'error'),
                          }
                        );
                      }}
                      className="btn-secondary !px-3 !py-2 !text-[11px]"
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
