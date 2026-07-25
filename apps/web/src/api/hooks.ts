import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { VendorSummary } from './types';
import type { CompanyProfile, ComplianceDoc, Invoice } from '../types';

export function useVendorSummary() {
  return useQuery({
    queryKey: ['vendor-summary'],
    queryFn: async () => {
      const me = await api.get<{ vendorId: string }>('/api/me');
      const { data } = await api.get<VendorSummary>(`/api/vendors/${me.data.vendorId}/summary`);
      return data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: CompanyProfile) => {
      const me = await api.get<{ vendorId: string }>('/api/me');
      const { data } = await api.patch(`/api/vendors/${me.data.vendorId}`, profile);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-summary'] }),
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'status' | 'submittedDate'> & { status?: string }) => {
      const { data } = await api.post<Invoice>('/api/invoices', {
        invoiceNumber: invoice.invoiceNumber,
        workOrderId: invoice.workOrderId,
        invoiceDate: invoice.invoiceDate,
        amountBeforeTax: invoice.amountBeforeTax,
        hst: invoice.hst,
        total: invoice.total,
        notes: invoice.notes,
        attachments: invoice.attachments,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-summary'] }),
  });
}

export function useUploadComplianceDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      file: File;
      name: string;
      type: string;
      expiryDate: string;
      replaceId?: string;
    }) => {
      const form = new FormData();
      form.append('file', payload.file);
      form.append('name', payload.name);
      form.append('type', payload.type);
      form.append('expiryDate', payload.expiryDate);
      if (payload.replaceId) form.append('replaceId', payload.replaceId);

      const { data } = await api.post<ComplianceDoc>('/api/compliance-docs/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-summary'] }),
  });
}

export function useRespondAccessRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'denied' }) => {
      const { data } = await api.patch(`/api/access-requests/${id}`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-summary'] }),
  });
}
