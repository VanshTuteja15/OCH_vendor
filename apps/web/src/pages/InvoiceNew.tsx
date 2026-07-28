import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, PartyPopper, ReceiptText } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Badge } from '../components/Badge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { PageIntro, SectionHeader } from '../components/ProductUI';
import { useCreateInvoice, useVendorSummary } from '../api/hooks';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, generateId, hasExpiredRequiredDoc } from '../lib/utils';

const steps = ['Select WO', 'Invoice Details', 'Review', 'Submit'];

export function InvoiceNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, isLoading, isError, error } = useVendorSummary();
  const createInvoice = useCreateInvoice();
  const showToast = useAppStore((s) => s.showToast);

  const [step, setStep] = useState(1);
  const [selectedWoId, setSelectedWoId] = useState(searchParams.get('wo') ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(() => generateId('INV-2026'));
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const blocked = data ? hasExpiredRequiredDoc(data.documents) : false;

  useEffect(() => {
    if (data && blocked) {
      showToast('Invoice submission is blocked until your expired document is renewed.', 'error');
      navigate('/compliance');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked, data]);

  if (isLoading) {
    return (
      <Layout title="Submit Invoice">
        <LoadingState />
      </Layout>
    );
  }
  if (isError || !data) {
    return (
      <Layout title="Submit Invoice">
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load data.'} />
      </Layout>
    );
  }
  if (blocked) return null;

  const selectedWo = data.workOrders.find((w) => w.id === selectedWoId);
  const amountNum = parseFloat(amount) || 0;
  const hst = amountNum * 0.13;
  const total = amountNum + hst;

  function handleSubmitInvoice() {
    createInvoice.mutate(
      {
        invoiceNumber,
        workOrderId: selectedWoId,
        invoiceDate,
        amountBeforeTax: amountNum,
        hst,
        total,
        notes,
        attachments: [],
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          showToast('Invoice submitted for review.', 'success');
        },
        onError: () => showToast('Failed to submit invoice.', 'error'),
      }
    );
  }

  return (
    <Layout title="Submit Invoice">
      <PageIntro
        eyebrow="Billing"
        title="Submit an invoice"
        description="Link your invoice to an active work order, confirm the amount, and send it to OCH for review."
      />
      {/* Stepper */}
      <div className="product-card flex items-center p-4">
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
        <div className="product-card p-10 text-center max-w-lg mx-auto">
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
              className="btn-primary"
            >
              View All Invoices
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="product-card">
          <SectionHeader title="Select a work order" description="Invoices must be linked to an active OCH work order" />
          <div className="p-5 space-y-3">
            {data.workOrders
              .filter((w) => w.status !== 'completed')
              .map((wo) => (
                <button
                  key={wo.id}
                  onClick={() => setSelectedWoId(wo.id)}
                  className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition-all ${
                    selectedWoId === wo.id
                      ? 'border-och-teal bg-och-teal-light shadow-[0_6px_18px_rgba(0,117,106,0.1)]'
                      : 'border-slate-200 hover:border-och-teal/30 hover:bg-slate-50'
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
          <div className="px-5 pb-5">
            <button
              disabled={!selectedWoId}
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              Continue →
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div>
            {selectedWo && (
              <div className="product-card mb-5">
                <SectionHeader title="Linked work order" trailing={<Badge kind="success">✓ Validated</Badge>} />
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
            <div className="product-card">
              <SectionHeader title="Invoice details" description="Enter the billing reference and approved amount" />
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="field-label">
                      Invoice Number
                    </label>
                    <input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="field-control"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="field-control"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="field-label">
                      Amount (Before Tax)
                    </label>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      className="field-control font-bold"
                    />
                    {selectedWo && amountNum > selectedWo.notToExceed && (
                      <div className="text-[11px] text-danger mt-1">
                        Exceeds work order NTE of {formatCurrency(selectedWo.notToExceed)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="field-label">
                      HST (13%)
                    </label>
                    <input
                      readOnly
                      value={formatCurrency(hst)}
                      className="field-control-locked"
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

          <div className="product-card h-fit">
            <SectionHeader title="Review notes" description="Optional context for the OCH accounts team" trailing={<ReceiptText className="h-4 w-4 text-och-teal" />} />
            <div className="p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-och-blue">
                  <LockKeyhole className="h-4 w-4 text-och-teal" />
                  Attachments unavailable
                </div>
                <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
                  File uploads are intentionally out of scope for this release. You can submit invoice details without an attachment.
                </p>
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-gray-100">
                <div className="field-label mb-2">
                  Notes to OCH (optional)
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="field-control min-h-24 resize-y"
                  placeholder="Add any notes about this invoice..."
                />
              </div>

              <div className="flex gap-2 mt-3.5">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  disabled={!amountNum}
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Continue to Review →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="product-card max-w-2xl mx-auto">
          <SectionHeader title="Review & submit" description="Confirm the details before sending this invoice to OCH" />
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
                <div>Not included</div>
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
                className="btn-secondary"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitInvoice}
                disabled={createInvoice.isPending}
                className="btn-primary flex-1"
              >
                {createInvoice.isPending ? 'Submitting…' : 'Submit Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
