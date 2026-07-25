import type {
  AccessRequest,
  CompanyProfile,
  ComplianceDoc,
  Invoice,
  InvoiceAttachment,
  WorkOrder,
} from '../types';

export type VendorSummary = {
  vendorId: string;
  vendorName: string;
  initials: string;
  status: string;
  profile: CompanyProfile;
  banking: {
    paymentMethod: string;
    institutionNumber: string;
    transitNumber: string;
    accountNumber: string;
    pendingChangeRequested: boolean;
    pendingChangeRequestedDate?: string;
  };
  documents: (ComplianceDoc & { fileUrl?: string | null })[];
  workOrders: WorkOrder[];
  invoices: (Invoice & { attachments: (InvoiceAttachment & { fileUrl?: string | null })[] })[];
  accessRequests: AccessRequest[];
};
