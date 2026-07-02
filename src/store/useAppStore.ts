import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  VendorData,
  ComplianceDoc,
  Invoice,
  AccessRequest,
  CompanyProfile,
} from '../types';
import { VENDOR_ACCOUNTS, seedVendorData } from '../data/seed';
import { generateId } from '../lib/utils';

interface AppState {
  isAuthenticated: boolean;
  currentVendorId: string | null;
  vendorData: Record<string, VendorData>;
  toast: { message: string; kind: 'success' | 'error' | 'info' } | null;

  login: (email: string, password: string, mfaCode: string) => { ok: boolean; error?: string };
  logout: () => void;
  switchVendor: (vendorId: string) => void;

  addDocument: (doc: ComplianceDoc) => void;
  replaceDocument: (docId: string, doc: Partial<ComplianceDoc>) => void;

  addInvoice: (invoice: Invoice) => void;

  updateProfile: (profile: CompanyProfile) => void;
  requestBankingChange: () => void;

  respondAccessRequest: (id: string, status: 'approved' | 'denied') => void;

  showToast: (message: string, kind?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

function ensureVendorData(state: AppState, vendorId: string): VendorData {
  return state.vendorData[vendorId] ?? seedVendorData(vendorId);
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentVendorId: null,
      vendorData: {},
      toast: null,

      login: (email, password, mfaCode) => {
        const account = VENDOR_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!account) {
          return { ok: false, error: 'No vendor account found for that email address.' };
        }
        if (account.password !== password) {
          return { ok: false, error: 'Incorrect password. Please try again.' };
        }
        if (mfaCode !== '123456') {
          return { ok: false, error: 'Invalid authentication code. Please check your app and try again.' };
        }
        set((state) => {
          const data = ensureVendorData(state, account.vendorId);
          return {
            isAuthenticated: true,
            currentVendorId: account.vendorId,
            vendorData: { ...state.vendorData, [account.vendorId]: data },
          };
        });
        return { ok: true };
      },

      logout: () => set({ isAuthenticated: false, currentVendorId: null }),

      switchVendor: (vendorId) =>
        set((state) => {
          const data = ensureVendorData(state, vendorId);
          return {
            isAuthenticated: true,
            currentVendorId: vendorId,
            vendorData: { ...state.vendorData, [vendorId]: data },
          };
        }),

      addDocument: (doc) =>
        set((state) => {
          const vid = state.currentVendorId;
          if (!vid) return state;
          const data = ensureVendorData(state, vid);
          const existingIdx = data.documents.findIndex((d) => d.type === doc.type);
          const documents =
            existingIdx >= 0
              ? data.documents.map((d, i) => (i === existingIdx ? doc : d))
              : [...data.documents, doc];
          return {
            vendorData: { ...state.vendorData, [vid]: { ...data, documents } },
          };
        }),

      replaceDocument: (docId, patch) =>
        set((state) => {
          const vid = state.currentVendorId;
          if (!vid) return state;
          const data = ensureVendorData(state, vid);
          const documents = data.documents.map((d) => (d.id === docId ? { ...d, ...patch } : d));
          return {
            vendorData: { ...state.vendorData, [vid]: { ...data, documents } },
          };
        }),

      addInvoice: (invoice) =>
        set((state) => {
          const vid = state.currentVendorId;
          if (!vid) return state;
          const data = ensureVendorData(state, vid);
          return {
            vendorData: {
              ...state.vendorData,
              [vid]: { ...data, invoices: [invoice, ...data.invoices] },
            },
          };
        }),

      updateProfile: (profile) =>
        set((state) => {
          const vid = state.currentVendorId;
          if (!vid) return state;
          const data = ensureVendorData(state, vid);
          return {
            vendorData: { ...state.vendorData, [vid]: { ...data, profile } },
          };
        }),

      requestBankingChange: () =>
        set((state) => {
          const vid = state.currentVendorId;
          if (!vid) return state;
          const data = ensureVendorData(state, vid);
          return {
            vendorData: {
              ...state.vendorData,
              [vid]: {
                ...data,
                banking: {
                  ...data.banking,
                  pendingChangeRequested: true,
                  pendingChangeRequestedDate: new Date().toISOString().slice(0, 10),
                },
              },
            },
          };
        }),

      respondAccessRequest: (id, status) =>
        set((state) => {
          const vid = state.currentVendorId;
          if (!vid) return state;
          const data = ensureVendorData(state, vid);
          const accessRequests: AccessRequest[] = data.accessRequests.map((r) =>
            r.id === id ? { ...r, status } : r
          );
          return {
            vendorData: { ...state.vendorData, [vid]: { ...data, accessRequests } },
          };
        }),

      showToast: (message, kind = 'success') => set({ toast: { message, kind } }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'och-vendor-portal-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentVendorId: state.currentVendorId,
        vendorData: state.vendorData,
      }),
    }
  )
);

export function newDocId() {
  return generateId('DOC');
}
