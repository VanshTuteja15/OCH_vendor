import type {
  AccessRequest,
  ComplianceDoc,
  Invoice,
  OwnershipCategory as PrismaOwnership,
  Vendor,
  WorkOrder,
} from '@prisma/client';
import type { InvoiceAttachment } from '@prisma/client';

const ownershipToUi: Record<PrismaOwnership, string> = {
  PREFER_NOT_TO_DISCLOSE: 'Prefer not to disclose',
  WOMEN_OWNED: 'Women-owned business',
  INDIGENOUS_OWNED: 'Indigenous-owned business',
  MINORITY_OWNED: 'Minority-owned business',
};

const ownershipFromUi: Record<string, PrismaOwnership> = {
  'Prefer not to disclose': 'PREFER_NOT_TO_DISCLOSE',
  'Women-owned business': 'WOMEN_OWNED',
  'Indigenous-owned business': 'INDIGENOUS_OWNED',
  'Minority-owned business': 'MINORITY_OWNED',
};

export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function mapOwnershipToUi(value: PrismaOwnership): string {
  return ownershipToUi[value];
}

export function mapOwnershipFromUi(value: string): PrismaOwnership {
  return ownershipFromUi[value] ?? 'PREFER_NOT_TO_DISCLOSE';
}

export function mapVendorProfile(vendor: Vendor) {
  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    initials: vendor.initials,
    status: vendor.status,
    profile: {
      legalName: vendor.legalName,
      phone: vendor.phone,
      email: vendor.email,
      street: vendor.street,
      city: vendor.city,
      province: vendor.province,
      postalCode: vendor.postalCode,
      ownershipCategory: mapOwnershipToUi(vendor.ownershipCategory),
      diversityNotes: vendor.diversityNotes,
    },
    banking: {
      paymentMethod: vendor.paymentMethod,
      institutionNumber: vendor.institutionNumber,
      transitNumber: vendor.transitNumber,
      accountNumber: vendor.accountNumber,
      pendingChangeRequested: vendor.pendingChangeRequested,
      pendingChangeRequestedDate: vendor.pendingChangeRequestedDate ?? undefined,
    },
  };
}

export function mapDocument(doc: ComplianceDoc) {
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type,
    uploadedDate: toDateString(doc.uploadedDate),
    expiryDate: toDateString(doc.expiryDate),
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    fileUrl: doc.fileUrl,
    required: doc.required,
  };
}

export function mapWorkOrder(wo: WorkOrder) {
  return {
    id: wo.id,
    location: wo.location,
    serviceType: wo.serviceType,
    priority: wo.priority,
    status: wo.status,
    notToExceed: wo.notToExceed,
    createdDate: toDateString(wo.createdDate),
    completedAt: wo.completedAt ? toDateString(wo.completedAt) : null,
  };
}

export function mapInvoice(invoice: Invoice & { attachments: InvoiceAttachment[] }) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    workOrderId: invoice.workOrderId,
    invoiceDate: toDateString(invoice.invoiceDate),
    amountBeforeTax: invoice.amountBeforeTax,
    hst: invoice.hst,
    total: invoice.total,
    status: invoice.status,
    notes: invoice.notes,
    submittedDate: toDateString(invoice.submittedDate),
    attachments: invoice.attachments.map((a) => ({
      fileName: a.fileName,
      fileSize: a.fileSize,
      fileUrl: a.fileUrl,
    })),
  };
}

export function mapAccessRequest(ar: AccessRequest) {
  return {
    id: ar.id,
    requestedBy: ar.requestedBy,
    role: ar.role,
    status: ar.status,
    requestedDate: toDateString(ar.requestedDate),
  };
}
