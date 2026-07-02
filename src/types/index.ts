export type DocStatus = 'valid' | 'expiring' | 'expired';

export interface ComplianceDoc {
  id: string;
  name: string;
  type: string;
  uploadedDate: string; // ISO date
  expiryDate: string; // ISO date
  fileName: string;
  fileSize: number; // bytes
  required: boolean;
}

export type WorkOrderPriority = 'high' | 'medium' | 'low';
export type WorkOrderStatus = 'onsite' | 'scheduled' | 'pending' | 'completed';

export interface WorkOrder {
  id: string;
  location: string;
  serviceType: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  notToExceed: number;
  createdDate: string;
}

export type InvoiceStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface InvoiceAttachment {
  fileName: string;
  fileSize: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  workOrderId: string;
  invoiceDate: string;
  amountBeforeTax: number;
  hst: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
  attachments: InvoiceAttachment[];
  submittedDate: string;
}

export type OwnershipCategory =
  | 'Prefer not to disclose'
  | 'Women-owned business'
  | 'Indigenous-owned business'
  | 'Minority-owned business';

export interface BankingInfo {
  paymentMethod: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  pendingChangeRequested: boolean;
  pendingChangeRequestedDate?: string;
}

export interface CompanyProfile {
  legalName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  ownershipCategory: OwnershipCategory;
  diversityNotes: string;
}

export interface AccessRequest {
  id: string;
  requestedBy: string;
  role: string;
  status: 'pending' | 'approved' | 'denied';
  requestedDate: string;
}

export interface VendorAccount {
  vendorId: string;
  vendorName: string;
  email: string;
  password: string;
  initials: string;
}

export interface VendorData {
  profile: CompanyProfile;
  banking: BankingInfo;
  documents: ComplianceDoc[];
  workOrders: WorkOrder[];
  invoices: Invoice[];
  accessRequests: AccessRequest[];
}
