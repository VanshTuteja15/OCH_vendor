import { useRef, useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { docStatus, formatBytes, formatDate, daysUntil, hasExpiredRequiredDoc } from '../lib/utils';
import type { ComplianceDoc } from '../types';

const DOC_TYPES = [
  'WSIB Clearance Certificate',
  'General Liability Insurance',
  'Business License',
  'TSSA License',
  'Other Certification',
];

export function ComplianceDocs() {
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  const addDocument = useAppStore((s) => s.addDocument);
  const replaceDocument = useAppStore((s) => s.replaceDocument);
  const showToast = useAppStore((s) => s.showToast);

  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!data) return null;
  const expired = hasExpiredRequiredDoc(data.documents);
  const validCount = data.documents.filter((d) => docStatus(d) !== 'expired').length;
  const expiredCount = data.documents.length - validCount;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function handleUpload() {
    if (!file || !expiryDate) {
      showToast('Please select a file and an expiry date.', 'error');
      return;
    }
    const doc: ComplianceDoc = {
      id: replacingId ?? `DOC-${Date.now()}`,
      name:
        docType === 'WSIB Clearance Certificate'
          ? 'WSIB Clearance Certificate'
          : docType === 'General Liability Insurance'
          ? 'General Liability Insurance Certificate'
          : docType === 'Business License'
          ? 'City of Ottawa Business License'
          : docType,
      type: docType,
      uploadedDate: new Date().toISOString().slice(0, 10),
      expiryDate,
      fileName: file.name,
      fileSize: file.size,
      required: true,
    };
    if (replacingId) {
      replaceDocument(replacingId, doc);
    } else {
      addDocument(doc);
    }
    showToast(`${doc.name} uploaded successfully.`, 'success');
    setFile(null);
    setExpiryDate('');
    setReplacingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function startReplace(doc: ComplianceDoc) {
    setReplacingId(doc.id);
    setDocType(doc.type);
    setExpiryDate('');
    setFile(null);
    document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <Layout
      title="Compliance Documents"
      actions={
        <button
          onClick={() => document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-1.5 bg-och-teal hover:bg-och-teal-dark text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Upload Document
        </button>
      }
    >
      {expired && (
        <Alert kind="danger">
          <strong>Invoice Submission Blocked</strong> — one or more required documents have expired.
          Upload a valid certificate to restore invoice access.
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm mb-3.5">
        <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-center justify-between">
          <div className="text-[13px] font-bold text-gray-900">Required Documents</div>
          <div className="text-[11px] text-gray-400">
            {validCount} of {data.documents.length} valid
            {expiredCount > 0 && ` · ${expiredCount} expired`}
          </div>
        </div>
        <div className="p-4.5">
          {data.documents.map((doc) => {
            const status = docStatus(doc);
            const days = daysUntil(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 ${
                  status === 'expired' ? 'bg-[#fdecea] rounded-md px-2 -mx-2 mb-2' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                    status === 'expired' ? 'bg-[#f8d7da]' : 'bg-och-teal-light'
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 ${status === 'expired' ? 'text-[#721c24]' : 'text-och-teal'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{doc.name}</div>
                  <div className="text-[11px] text-gray-400">
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
                <button
                  onClick={() => startReplace(doc)}
                  className={`text-[11px] font-semibold rounded-md px-2.5 py-1 whitespace-nowrap ${
                    status === 'expired'
                      ? 'bg-danger text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {status === 'expired' ? 'Upload New' : 'Replace'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div id="upload-card" className="bg-white rounded-lg border border-gray-200 shadow-card-sm scroll-mt-4">
        <div className="px-4.5 py-3.5 border-b border-gray-200">
          <div className="text-[13px] font-bold text-gray-900">
            {replacingId ? 'Replace Document' : 'Upload New Document'}
          </div>
        </div>
        <div className="p-4.5">
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                disabled={!!replacingId}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] disabled:bg-gray-100 disabled:text-gray-400"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
              />
            </div>
          </div>

          <label
            htmlFor="doc-file-input"
            className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-gray-50 hover:border-och-teal hover:bg-och-teal-light cursor-pointer flex flex-col items-center gap-2 transition-colors block"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
            {file ? (
              <div className="text-xs text-gray-700 font-medium">
                {file.name} · {formatBytes(file.size)}
              </div>
            ) : (
              <div className="text-xs text-gray-700">
                Drop PDF here or <span className="text-och-teal font-semibold">browse files</span>
              </div>
            )}
            <div className="text-[11px] text-gray-400">PDF, JPG, or PNG · Max 10 MB</div>
            <input
              id="doc-file-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          <div className="flex gap-2 mt-3.5">
            <button
              onClick={handleUpload}
              className="bg-och-teal hover:bg-och-teal-dark text-white text-[13px] font-semibold px-4 py-2 rounded-md transition-colors"
            >
              {replacingId ? 'Upload Replacement' : 'Upload Document'}
            </button>
            {replacingId && (
              <button
                onClick={() => {
                  setReplacingId(null);
                  setFile(null);
                  setExpiryDate('');
                }}
                className="text-[13px] font-semibold px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
