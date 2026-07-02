import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, PartyPopper } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, formatBytes, generateId, hasExpiredRequiredDoc } from '../lib/utils';
import type { Invoice, InvoiceAttachment } from '../types';

const steps = ['Select WO', 'Invoice Details', 'Upload & Review', 'Submit'];

export function InvoiceNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  const addInvoice = useAppStore((s) => s.addInvoice);
  const showToast = useAppStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [selectedWoId, setSelectedWoId] = useState(searchParams.get('wo') ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateId('INV-2026'));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const blocked = data ? hasExpiredRequiredDoc(data.documents) : false;

  useEffect(() => {
    if (blocked) {
      showToast('Invoice submission is blocked until your expired document is renewed.', 'error');
      navigate('/compliance');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  if (!data || blocked) return null;

  const selectedWo = data.workOrders.find((w) => w.id === selectedWoId);
  const amountNum = parseFloat(amount) || 0;
  const hst = amountNum * 0.13;
  const total = amountNum + hst;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAttachments((prev) => [...prev, { fileName: f.name, fileSize: f.size }]);
  }

  function handleSubmitInvoice() {
    const invoice: Invoice = {
      id: generateId('INV'),
      invoiceNumber,
      workOrderId: selectedWoId,
      invoiceDate,
      amountBeforeTax: amountNum,
      hst,
      total,
      status: 'pending',
      notes,
      attachments,
      submittedDate: new Date().toISOString().slice(0, 10),
    };
    addInvoice(invoice);
    setSubmitted(true);
    showToast('Invoice submitted for review.', 'success');
  }

  return (
    <Layout title="Submit Invoice">
      {/* Stepper */}
      <div className="flex items-center mb-5">
        {steps.map((label, i) => {
          const num = i + 1;
          const state = submitted ? 'done' : num < step ? 'done' : num === step ? 'active' : 'pending';
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    state === 'done'
                      ? 'bg-och-teal text-white'
                      : state === 'active'
                      ? 'bg-och-blue text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {state === 'done' ? '✓' : num}
                </div>
                <div
                  className={`text-[11px] font-semibold ${
                    state === 'done' ? 'text-och-teal' : state === 'active' ? 'text-och-blue' : 'text-gray-500'
                  }`}
                >
                  {label}
                </div>
              </div>
              {num < steps.length && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    num < step || submitted ? 'bg-och-teal' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {submitted ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm p-10 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-och-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-7 h-7 text-och-teal" />
          </div>
          <div className="font-display text-lg font-bold text-gray-900 mb-1.5">Invoice submitted</div>
          <div className="text-sm text-gray-500 mb-6">
            {invoiceNumber} for {formatCurrency(total)} has been sent to OCH for review. You'll be
            notified once it's approved.
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate('/invoices')}
              className="bg-och-teal hover:bg-och-teal-dark text-white text-sm font-semibold px-5 py-2.5 rounded-md"
            >
              View All Invoices
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="border border-gray-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
          <div className="px-4.5 py-3.5 border-b border-gray-200">
            <div className="text-[13px] font-bold text-gray-900">Select a Work Order</div>
          </div>
          <div className="p-4.5 space-y-2">
            {data.workOrders
              .filter((w) => w.status !== 'completed')
              .map((wo) => (
                <button
                  key={wo.id}
                  onClick={() => setSelectedWoId(wo.id)}
                  className={`w-full text-left rounded-lg border-2 p-3.5 flex items-center justify-between transition-colors ${
                    selectedWoId === wo.id
                      ? 'border-och-teal bg-och-teal-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-och-teal">{wo.id}</div>
                    <div className="text-xs text-gray-700">{wo.location}</div>
                    <div className="text-[11px] text-gray-400">{wo.serviceType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase">Not to Exceed</div>
                    <div className="text-sm font-bold text-[#155724]">{formatCurrency(wo.notToExceed)}</div>
                  </div>
                </button>
              ))}
          </div>
          <div className="px-4.5 pb-4.5">
            <button
              disabled={!selectedWoId}
              onClick={() => setStep(2)}
              className="w-full justify-center bg-och-teal hover:bg-och-teal-dark disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-semibold py-2.5 rounded-md transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            {selectedWo && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm mb-3.5">
                <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                  <div className="text-[13px] font-bold text-gray-900">Linked Work Order</div>
                  <Badge kind="success">✓ Validated</Badge>
                </div>
                <div className="p-4.5 grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">WO Number</div>
                    <div className="font-bold text-och-teal">{selectedWo.id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">Location</div>
                    <div className="font-semibold">{selectedWo.location}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">Service Type</div>
                    <div>{selectedWo.serviceType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase mb-0.5">Not to Exceed</div>
                    <div className="font-bold text-[#155724]">{formatCurrency(selectedWo.notToExceed)}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
              <div className="px-4.5 py-3.5 border-b border-gray-200">
                <div className="text-[13px] font-bold text-gray-900">Invoice Details</div>
              </div>
              <div className="p-4.5">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                      Invoice Number
                    </label>
                    <input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                      Amount (Before Tax)
                    </label>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] font-bold"
                    />
                    {selectedWo && amountNum > selectedWo.notToExceed && (
                      <div className="text-[11px] text-danger mt-1">
                        Exceeds work order NTE of {formatCurrency(selectedWo.notToExceed)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                      HST (13%)
                    </label>
                    <input
                      readOnly
                      value={formatCurrency(hst)}
                      className="w-full border border-gray-300 bg-gray-100 text-gray-500 rounded-md px-3 py-2 text-[13px]"
                    />
                  </div>
                </div>
                <div className="bg-och-teal-light rounded-md px-3.5 py-2.5 flex justify-between items-center">
                  <div className="text-xs font-semibold text-och-teal-dark">Total Amount</div>
                  <div className="text-lg font-bold text-och-teal-dark">{formatCurrency(total)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm h-fit">
            <div className="px-4.5 py-3.5 border-b border-gray-200">
              <div className="text-[13px] font-bold text-gray-900">Supporting Documents</div>
            </div>
            <div className="p-4.5">
              <label
                htmlFor="invoice-file"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4.5 text-center bg-gray-50 hover:border-och-teal hover:bg-och-teal-light cursor-pointer flex flex-col items-center gap-2 mb-3.5 block"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-xs text-gray-700">Upload invoice PDF or supporting docs</div>
                <div className="text-[11px] text-gray-400">PDF, JPG, or PNG</div>
                <input
                  id="invoice-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>

              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-8 h-8 bg-och-teal-light rounded-md flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-och-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{a.fileName}</div>
                    <div className="text-[11px] text-gray-400">{formatBytes(a.fileSize)}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                </div>
              ))}

              <div className="mt-3.5 pt-3.5 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Notes to OCH (optional)
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs h-16 resize-none"
                  placeholder="Add any notes about this invoice..."
                />
              </div>

              <div className="flex gap-2 mt-3.5">
                <button
                  onClick={() => setStep(1)}
                  className="border border-gray-300 text-gray-700 text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  disabled={!amountNum || attachments.length === 0}
                  onClick={() => setStep(3)}
                  className="flex-1 justify-center bg-och-teal hover:bg-och-teal-dark disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-semibold py-2.5 rounded-md transition-colors"
                >
                  Continue to Review →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm max-w-2xl mx-auto">
          <div className="px-4.5 py-3.5 border-b border-gray-200">
            <div className="text-[13px] font-bold text-gray-900">Review & Submit</div>
          </div>
          <div className="p-4.5 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-0.5">Work Order</div>
                <div className="font-semibold">{selectedWoId}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-0.5">Invoice Number</div>
                <div className="font-semibold">{invoiceNumber}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-0.5">Invoice Date</div>
                <div>{invoiceDate}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-0.5">Attachments</div>
                <div>{attachments.length} file(s)</div>
              </div>
            </div>
            <div className="bg-och-teal-light rounded-md px-3.5 py-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-700">Amount before tax</span>
                <span className="font-semibold">{formatCurrency(amountNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">HST (13%)</span>
                <span className="font-semibold">{formatCurrency(hst)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-och-teal/20">
                <span className="font-bold text-och-teal-dark">Total</span>
                <span className="font-bold text-och-teal-dark">{formatCurrency(total)}</span>
              </div>
            </div>
            {notes && (
              <div>
                <div className="text-[10px] text-gray-400 uppercase mb-0.5">Notes</div>
                <div className="text-gray-700">{notes}</div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="border border-gray-300 text-gray-700 text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitInvoice}
                className="flex-1 justify-center bg-och-teal hover:bg-och-teal-dark text-white text-[13px] font-semibold py-2.5 rounded-md transition-colors"
              >
                Submit Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
