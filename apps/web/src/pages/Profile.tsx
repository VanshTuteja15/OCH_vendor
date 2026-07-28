import { useEffect, useState } from 'react';
import { Pencil, Clock, Building2, Landmark } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import { Badge } from '../components/Badge';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { LockedCaption, PageIntro, SectionHeader } from '../components/ProductUI';
import { useUpdateProfile, useVendorSummary } from '../api/hooks';
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
  const { data, isLoading, isError, error } = useVendorSummary();
  const updateProfile = useUpdateProfile();
  const showToast = useAppStore((s) => s.showToast);

  const [form, setForm] = useState<CompanyProfile | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setForm(data.profile);
      setDirty(false);
    }
  }, [data?.profile]);

  if (isError || !data) {
    return (
      <Layout title="Company Profile">
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load profile.'} />
      </Layout>
    );
  }
  if (isLoading || !form) {
    return (
      <Layout title="Company Profile">
        <LoadingState />
      </Layout>
    );
  }

  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setDirty(true);
  }

  function handleSave() {
    if (!form) return;
    updateProfile.mutate(form, {
      onSuccess: () => {
        setDirty(false);
        showToast('Company profile saved.', 'success');
      },
      onError: () => showToast('Failed to save profile.', 'error'),
    });
  }

  function handleCancel() {
    if (!data) return;
    setForm(data.profile);
    setDirty(false);
  }

  return (
    <Layout title="Company Profile">
      <PageIntro
        eyebrow="Organization"
        title="Company profile"
        description="Keep your business identity, contact information, and voluntary supplier-diversity details current."
        actions={
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={!dirty}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || updateProfile.isPending}
            className="btn-primary"
          >
            Save Changes
          </button>
        </div>
        }
      />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div>
          <div className="product-card">
            <SectionHeader
              title="Company information"
              description="Primary legal identity and mailing address"
              trailing={<Building2 className="h-4 w-4 text-och-teal" />}
            />
            <div className="space-y-5 p-5">
              <div className="field-group">
                <label className="field-label">
                  Legal Company Name
                </label>
                <input
                  value={form.legalName}
                  onChange={(e) => set('legalName', e.target.value)}
                  className="field-control"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="field-group">
                  <label className="field-label">
                    Business Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="field-control"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">
                    Primary Email
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="field-control"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-och-teal/15 pb-2 font-display text-sm font-bold text-och-teal-dark">
                Mailing Address
              </div>
              <div className="field-group">
                <label className="field-label">
                  Street Address
                </label>
                <input
                  value={form.street}
                  onChange={(e) => set('street', e.target.value)}
                  className="field-control"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="field-group">
                  <label className="field-label">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className="field-control"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">
                    Province
                  </label>
                  <input
                    value={form.province}
                    onChange={(e) => set('province', e.target.value)}
                    className="field-control"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">
                    Postal Code
                  </label>
                  <input
                    value={form.postalCode}
                    onChange={(e) => set('postalCode', e.target.value)}
                    className="field-control"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="product-card mb-5">
            <SectionHeader
              title="Banking & payment"
              description="Protected payment destination details"
              trailing={<div className="flex items-center gap-2"><Badge kind="warn">Requires approval</Badge><Landmark className="h-4 w-4 text-och-teal" /></div>}
            />
            <div className="p-5">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="field-group">
                  <label className="field-label">
                    Payment Method
                  </label>
                  <select
                    disabled
                    className="field-control-locked"
                  >
                    <option>{data.banking.paymentMethod}</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">
                    Institution Number
                  </label>
                  <input
                    disabled
                    value={data.banking.institutionNumber}
                    className="field-control-locked"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="field-group">
                  <label className="field-label">
                    Transit Number
                  </label>
                  <input
                    disabled
                    value={'•'.repeat(5)}
                    className="field-control-locked tracking-[0.2em]"
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">
                    Account Number
                  </label>
                  <input
                    disabled
                    value={'•'.repeat(10)}
                    className="field-control-locked tracking-[0.2em]"
                  />
                </div>
              </div>
              <LockedCaption>
                Locked — payment details require identity verification and written approval from OCH Procurement.
              </LockedCaption>
              <button
                onClick={() =>
                  showToast('Banking change requests are not available in this demo yet.', 'info')
                }
                disabled={data.banking.pendingChangeRequested}
                className="btn-secondary mt-4"
              >
                <Pencil className="w-3 h-3" />
                {data.banking.pendingChangeRequested ? 'Request Pending' : 'Request Banking Change'}
              </button>
            </div>
          </div>

          <div className="product-card">
            <SectionHeader
              title="Supplier diversity"
              description="Voluntary information used for aggregate reporting"
              trailing={<Badge kind="gray">Voluntary</Badge>}
            />
            <div className="p-5">
              <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
                This information is collected voluntarily to support OCH's supplier diversity
                reporting. It will not affect your eligibility or evaluation.
              </div>
              <div className="field-group">
                <label className="field-label">
                  Business Ownership Category
                </label>
                <select
                  value={form.ownershipCategory}
                  onChange={(e) => set('ownershipCategory', e.target.value as OwnershipCategory)}
                  className="field-control"
                >
                  {OWNERSHIP_OPTIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="field-group mt-4">
                <label className="field-label">
                  Workforce Diversity Notes
                </label>
                <textarea
                  value={form.diversityNotes}
                  onChange={(e) => set('diversityNotes', e.target.value)}
                  placeholder="Optional..."
                  className="field-control min-h-24 resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
