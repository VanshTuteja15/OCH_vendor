import { useState } from 'react';
import { Pencil, Clock } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { useAppStore } from '../store/useAppStore';
import { formatDate } from '../lib/utils';
import type { CompanyProfile, OwnershipCategory } from '../types';

const OWNERSHIP_OPTIONS: OwnershipCategory[] = [
  'Prefer not to disclose',
  'Women-owned business',
  'Indigenous-owned business',
  'Minority-owned business',
];

export function Profile() {
  const currentVendorId = useAppStore((s) => s.currentVendorId)!;
  const data = useAppStore((s) => s.vendorData[currentVendorId]);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const requestBankingChange = useAppStore((s) => s.requestBankingChange);
  const showToast = useAppStore((s) => s.showToast);

  const [form, setForm] = useState<CompanyProfile | null>(data?.profile ?? null);
  const [dirty, setDirty] = useState(false);

  if (!data || !form) return null;

  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setDirty(true);
  }

  function handleSave() {
    if (!form) return;
    updateProfile(form);
    setDirty(false);
    showToast('Company profile saved.', 'success');
  }

  function handleCancel() {
    setForm(data.profile);
    setDirty(false);
  }

  return (
    <Layout
      title="Company Profile"
      actions={
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={!dirty}
            className="border border-gray-300 text-gray-700 text-[11px] font-semibold px-3.5 py-1.5 rounded-md hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="bg-och-teal hover:bg-och-teal-dark disabled:bg-gray-200 disabled:text-gray-400 text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-md transition-colors"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
            <div className="px-4.5 py-3.5 border-b border-gray-200">
              <div className="text-[13px] font-bold text-gray-900">Company Information</div>
            </div>
            <div className="p-4.5">
              <div className="mb-3">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Legal Company Name
                </label>
                <input
                  value={form.legalName}
                  onChange={(e) => set('legalName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Business Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Primary Email
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
              </div>

              <div className="text-xs font-bold text-och-teal uppercase tracking-wide pb-2 border-b-2 border-och-teal-light mb-3.5">
                Mailing Address
              </div>
              <div className="mb-2.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Street Address
                </label>
                <input
                  value={form.street}
                  onChange={(e) => set('street', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Province
                  </label>
                  <input
                    value={form.province}
                    onChange={(e) => set('province', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Postal Code
                  </label>
                  <input
                    value={form.postalCode}
                    onChange={(e) => set('postalCode', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm mb-3.5">
            <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <div className="text-[13px] font-bold text-gray-900">Banking & Payment</div>
              <Badge kind="warn">⚠ Requires OCH Approval</Badge>
            </div>
            <div className="p-4.5">
              {data.banking.pendingChangeRequested ? (
                <Alert kind="warn">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      A banking change request was submitted on{' '}
                      {data.banking.pendingChangeRequestedDate &&
                        formatDate(data.banking.pendingChangeRequestedDate)}{' '}
                      and is awaiting OCH Procurement approval.
                    </span>
                  </div>
                </Alert>
              ) : (
                <Alert kind="warn">
                  Changes to banking details require approval from OCH Procurement before taking
                  effect.
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Payment Method
                  </label>
                  <select
                    disabled
                    className="w-full border border-gray-300 bg-gray-100 text-gray-400 rounded-md px-3 py-2 text-[13px]"
                  >
                    <option>{data.banking.paymentMethod}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Institution Number
                  </label>
                  <input
                    disabled
                    value={data.banking.institutionNumber}
                    className="w-full border border-gray-300 bg-gray-100 text-gray-400 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-1">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Transit Number
                  </label>
                  <input
                    disabled
                    value={'•'.repeat(5)}
                    className="w-full border border-gray-300 bg-gray-100 text-gray-400 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Account Number
                  </label>
                  <input
                    disabled
                    value={'•'.repeat(10)}
                    className="w-full border border-gray-300 bg-gray-100 text-gray-400 rounded-md px-3 py-2 text-[13px]"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  requestBankingChange();
                  showToast('Banking change request sent to OCH Procurement.', 'success');
                }}
                disabled={data.banking.pendingChangeRequested}
                className="mt-1 flex items-center gap-1.5 border border-gray-300 text-gray-700 text-[11px] font-semibold px-3 py-1.5 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Pencil className="w-3 h-3" />
                {data.banking.pendingChangeRequested ? 'Request Pending' : 'Request Banking Change'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-card-sm">
            <div className="px-4.5 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <div className="text-[13px] font-bold text-gray-900">DEI Information</div>
              <Badge kind="gray">Voluntary</Badge>
            </div>
            <div className="p-4.5">
              <div className="text-xs text-gray-700 mb-3">
                This information is collected voluntarily to support OCH's supplier diversity
                reporting. It will not affect your eligibility or evaluation.
              </div>
              <div className="mb-2.5">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Business Ownership Category
                </label>
                <select
                  value={form.ownershipCategory}
                  onChange={(e) => set('ownershipCategory', e.target.value as OwnershipCategory)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px]"
                >
                  {OWNERSHIP_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Workforce Diversity Notes
                </label>
                <textarea
                  value={form.diversityNotes}
                  onChange={(e) => set('diversityNotes', e.target.value)}
                  placeholder="Optional..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs h-14 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
