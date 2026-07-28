import { FileText, ShieldCheck, LockKeyhole } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageIntro, SectionHeader } from '../components/ProductUI';
import { useVendorSummary } from '../api/hooks';
import { docStatus, formatBytes, formatDate, daysUntil, hasExpiredRequiredDoc } from '../lib/utils';

export function ComplianceDocs() {
  const { data, isLoading, isError, error } = useVendorSummary();

  if (isLoading) {
    return (
      <Layout title="Compliance Documents">
        <LoadingState />
      </Layout>
    );
  }
  if (isError || !data) {
    return (
      <Layout title="Compliance Documents">
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load compliance docs.'}
        />
      </Layout>
    );
  }

  const expired = hasExpiredRequiredDoc(data.documents);
  const validCount = data.documents.filter((d) => docStatus(d) !== 'expired').length;
  const expiredCount = data.documents.length - validCount;

  return (
    <Layout title="Compliance Documents">
      <PageIntro
        eyebrow="Risk & compliance"
        title="Compliance documents"
        description="Monitor the credentials OCH requires to keep your vendor account eligible for invoice submission."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 shadow-sm">
            <LockKeyhole className="h-3.5 w-3.5 text-och-teal" />
            Uploads coming soon
          </div>
        }
      />
      {expired && (
        <Alert kind="danger">
          <strong>Invoice Submission Blocked</strong> — one or more required documents have expired.
          Upload a valid certificate to restore invoice access.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="product-card p-4"><div className="page-kicker">Total required</div><div className="font-display text-2xl font-bold text-och-blue">{data.documents.length}</div></div>
        <div className="product-card p-4"><div className="page-kicker">Current</div><div className="font-display text-2xl font-bold text-success">{validCount}</div></div>
        <div className="product-card p-4"><div className="page-kicker">Expired</div><div className="font-display text-2xl font-bold text-danger">{expiredCount}</div></div>
      </div>

      <div className="product-card">
        <SectionHeader
          title="Required documents"
          description="Dates and statuses reflect the latest records received by OCH"
          trailing={<Badge kind={expiredCount ? 'danger' : 'success'}>{validCount} of {data.documents.length} current</Badge>}
        />
        <div className="p-5">
          {data.documents.map((doc) => {
            const status = docStatus(doc);
            const days = daysUntil(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-4 rounded-xl border p-4 mb-3 last:mb-0 ${
                  status === 'expired' ? 'border-red-200 bg-red-50/70' : 'border-slate-100 bg-slate-50/40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    status === 'expired' ? 'bg-[#f8d7da]' : 'bg-och-teal-light'
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 ${status === 'expired' ? 'text-[#721c24]' : 'text-och-teal'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-och-blue truncate">{doc.name}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Uploaded {formatDate(doc.uploadedDate)} · {doc.fileName} · {formatBytes(doc.fileSize)}
                  </div>
                </div>
                <div
                  className={`text-[11px] font-semibold whitespace-nowrap ${
                    status === 'valid' ? 'text-success' : status === 'expiring' ? 'text-warn' : 'text-danger'
                  }`}
                >
                  {status === 'expired'
                    ? `Expired ${formatDate(doc.expiryDate)}`
                    : `Expires ${formatDate(doc.expiryDate)}`}
                  {status === 'expiring' && <span className="text-gray-400"> · {days} days</span>}
                </div>
                <Badge kind={status === 'valid' ? 'success' : status === 'expiring' ? 'warn' : 'danger'} dot>
                  {status === 'valid' ? 'Valid' : status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                </Badge>
                <ShieldCheck className={`h-4 w-4 ${status === 'expired' ? 'text-danger' : 'text-success'}`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="locked-note">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        File uploads are intentionally unavailable in this release. Existing compliance records remain visible and current.
      </div>
    </Layout>
  );
}
