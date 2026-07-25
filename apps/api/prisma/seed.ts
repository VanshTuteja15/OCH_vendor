import 'dotenv/config';
import { PrismaClient, OwnershipCategory, InvoiceStatus, WorkOrderPriority, WorkOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const ownershipMap: Record<string, OwnershipCategory> = {
  'Prefer not to disclose': OwnershipCategory.PREFER_NOT_TO_DISCLOSE,
  'Women-owned business': OwnershipCategory.WOMEN_OWNED,
  'Indigenous-owned business': OwnershipCategory.INDIGENOUS_OWNED,
  'Minority-owned business': OwnershipCategory.MINORITY_OWNED,
};

type SeedVendor = {
  id: string;
  name: string;
  email: string;
  initials: string;
  profile: {
    legalName: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    ownershipCategory: string;
    diversityNotes: string;
  };
  banking: {
    paymentMethod: string;
    institutionNumber: string;
    transitNumber: string;
    accountNumber: string;
    pendingChangeRequested: boolean;
    pendingChangeRequestedDate?: string;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedDate: Date;
    expiryDate: Date;
    fileName: string;
    fileSize: number;
    required: boolean;
  }>;
  workOrders: Array<{
    id: string;
    location: string;
    serviceType: string;
    priority: WorkOrderPriority;
    status: WorkOrderStatus;
    notToExceed: number;
    createdDate: Date;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    workOrderId: string;
    invoiceDate: Date;
    amountBeforeTax: number;
    hst: number;
    total: number;
    status: InvoiceStatus;
    notes: string;
    attachments: Array<{ fileName: string; fileSize: number }>;
    submittedDate: Date;
  }>;
  accessRequests: Array<{
    id: string;
    requestedBy: string;
    role: string;
    status: 'pending' | 'approved' | 'denied';
    requestedDate: Date;
  }>;
};

function seedVendorData(vendorId: string): Omit<SeedVendor, 'id' | 'name' | 'email' | 'initials'> {
  if (vendorId === 'VID-2847') {
    return {
      profile: {
        legalName: 'ACME Cleaning Services Inc.',
        phone: '(613) 555-0142',
        email: 'accounts@acmecleaning.ca',
        street: '1450 Merivale Road, Suite 200',
        city: 'Ottawa',
        province: 'ON',
        postalCode: 'K2G 5N4',
        ownershipCategory: 'Prefer not to disclose',
        diversityNotes: '',
      },
      banking: {
        paymentMethod: 'EFT (Direct Deposit)',
        institutionNumber: '003',
        transitNumber: '12345',
        accountNumber: '0198765432',
        pendingChangeRequested: false,
      },
      documents: [
        {
          id: 'DOC-1-VID-2847',
          name: 'General Liability Insurance Certificate',
          type: 'General Liability Insurance',
          uploadedDate: addDays(-49),
          expiryDate: addDays(183),
          fileName: 'general_liability_2026.pdf',
          fileSize: 291000,
          required: true,
        },
        {
          id: 'DOC-2-VID-2847',
          name: 'WSIB Clearance Certificate',
          type: 'WSIB Clearance Certificate',
          uploadedDate: addDays(-174),
          expiryDate: addDays(-16),
          fileName: 'wsib_clearance_jan2026.pdf',
          fileSize: 159000,
          required: true,
        },
        {
          id: 'DOC-3-VID-2847',
          name: 'City of Ottawa Business License',
          type: 'Business License',
          uploadedDate: addDays(-120),
          expiryDate: addDays(61),
          fileName: 'business_license_2026.pdf',
          fileSize: 100000,
          required: true,
        },
      ],
      workOrders: [
        {
          id: 'WO-8821',
          location: '150 Lees Ave, Unit 4B',
          serviceType: 'Emergency Cleanup',
          priority: 'high',
          status: 'onsite',
          notToExceed: 2400,
          createdDate: addDays(-3),
        },
        {
          id: 'WO-8804',
          location: '200 Tremblay Rd',
          serviceType: 'Common Area Cleaning',
          priority: 'medium',
          status: 'scheduled',
          notToExceed: 850,
          createdDate: addDays(-6),
        },
        {
          id: 'WO-8791',
          location: '88 Hurdman Blvd',
          serviceType: 'Common Area Cleaning',
          priority: 'low',
          status: 'pending',
          notToExceed: 1200,
          createdDate: addDays(-9),
        },
      ],
      invoices: [
        {
          id: 'INV-1-VID-2847',
          invoiceNumber: 'INV-2026-0041',
          workOrderId: 'WO-8712',
          invoiceDate: addDays(-20),
          amountBeforeTax: 980,
          hst: 127.4,
          total: 1107.4,
          status: 'paid',
          notes: '',
          attachments: [{ fileName: 'INV-2026-0041.pdf', fileSize: 82000 }],
          submittedDate: addDays(-20),
        },
        {
          id: 'INV-2-VID-2847',
          invoiceNumber: 'INV-2026-0044',
          workOrderId: 'WO-8756',
          invoiceDate: addDays(-9),
          amountBeforeTax: 2620,
          hst: 340.6,
          total: 2960.6,
          status: 'pending',
          notes: '',
          attachments: [{ fileName: 'INV-2026-0044.pdf', fileSize: 91000 }],
          submittedDate: addDays(-9),
        },
        {
          id: 'INV-3-VID-2847',
          invoiceNumber: 'INV-2026-0046',
          workOrderId: 'WO-8780',
          invoiceDate: addDays(-2),
          amountBeforeTax: 1650,
          hst: 214.5,
          total: 1864.5,
          status: 'pending',
          notes: '',
          attachments: [{ fileName: 'INV-2026-0046.pdf', fileSize: 77000 }],
          submittedDate: addDays(-2),
        },
      ],
      accessRequests: [
        {
          id: 'AR-1-VID-2847',
          requestedBy: 'Sarah Nguyen',
          role: 'Team Member (Invoices only)',
          status: 'pending',
          requestedDate: addDays(-4),
        },
      ],
    };
  }

  if (vendorId === 'VID-3102') {
    return {
      profile: {
        legalName: 'Capital Elevator Services Ltd.',
        phone: '(613) 555-0198',
        email: 'ops@capitalelevator.ca',
        street: '875 Industrial Ave',
        city: 'Ottawa',
        province: 'ON',
        postalCode: 'K1G 4C5',
        ownershipCategory: 'Prefer not to disclose',
        diversityNotes: '',
      },
      banking: {
        paymentMethod: 'EFT (Direct Deposit)',
        institutionNumber: '004',
        transitNumber: '54321',
        accountNumber: '0245781190',
        pendingChangeRequested: true,
        pendingChangeRequestedDate: addDays(-2).toISOString().slice(0, 10),
      },
      documents: [
        {
          id: 'DOC-1-VID-3102',
          name: 'General Liability Insurance Certificate',
          type: 'General Liability Insurance',
          uploadedDate: addDays(-80),
          expiryDate: addDays(285),
          fileName: 'liability_cert_2026.pdf',
          fileSize: 254000,
          required: true,
        },
        {
          id: 'DOC-2-VID-3102',
          name: 'WSIB Clearance Certificate',
          type: 'WSIB Clearance Certificate',
          uploadedDate: addDays(-30),
          expiryDate: addDays(150),
          fileName: 'wsib_clearance_2026.pdf',
          fileSize: 143000,
          required: true,
        },
        {
          id: 'DOC-3-VID-3102',
          name: 'TSSA Elevator Contractor License',
          type: 'TSSA License',
          uploadedDate: addDays(-200),
          expiryDate: addDays(300),
          fileName: 'tssa_license_2026.pdf',
          fileSize: 188000,
          required: true,
        },
      ],
      workOrders: [
        {
          id: 'WO-7710',
          location: '25 Rideau St',
          serviceType: 'Elevator Inspection',
          priority: 'medium',
          status: 'scheduled',
          notToExceed: 1800,
          createdDate: addDays(-5),
        },
        {
          id: 'WO-7695',
          location: '400 Albert St',
          serviceType: 'Preventive Maintenance',
          priority: 'low',
          status: 'completed',
          notToExceed: 950,
          createdDate: addDays(-14),
        },
      ],
      invoices: [
        {
          id: 'INV-1-VID-3102',
          invoiceNumber: 'INV-2026-0112',
          workOrderId: 'WO-7695',
          invoiceDate: addDays(-13),
          amountBeforeTax: 950,
          hst: 123.5,
          total: 1073.5,
          status: 'approved',
          notes: '',
          attachments: [{ fileName: 'INV-2026-0112.pdf', fileSize: 68000 }],
          submittedDate: addDays(-13),
        },
      ],
      accessRequests: [],
    };
  }

  return {
    profile: {
      legalName: 'NorthStar Landscaping & Grounds Inc.',
      phone: '(613) 555-0177',
      email: 'billing@northstarlandscape.ca',
      street: '210 Coventry Rd',
      city: 'Ottawa',
      province: 'ON',
      postalCode: 'K1K 4S1',
      ownershipCategory: 'Indigenous-owned business',
      diversityNotes: 'Certified through CCAB Progressive Aboriginal Relations program.',
    },
    banking: {
      paymentMethod: 'EFT (Direct Deposit)',
      institutionNumber: '010',
      transitNumber: '67890',
      accountNumber: '0356214789',
      pendingChangeRequested: false,
    },
    documents: [
      {
        id: 'DOC-1-VID-1955',
        name: 'General Liability Insurance Certificate',
        type: 'General Liability Insurance',
        uploadedDate: addDays(-100),
        expiryDate: addDays(20),
        fileName: 'liability_cert_2026.pdf',
        fileSize: 231000,
        required: true,
      },
      {
        id: 'DOC-2-VID-1955',
        name: 'WSIB Clearance Certificate',
        type: 'WSIB Clearance Certificate',
        uploadedDate: addDays(-60),
        expiryDate: addDays(120),
        fileName: 'wsib_clearance_2026.pdf',
        fileSize: 151000,
        required: true,
      },
      {
        id: 'DOC-3-VID-1955',
        name: 'City of Ottawa Business License',
        type: 'Business License',
        uploadedDate: addDays(-150),
        expiryDate: addDays(200),
        fileName: 'business_license_2026.pdf',
        fileSize: 97000,
        required: true,
      },
    ],
    workOrders: [
      {
        id: 'WO-6640',
        location: '55 Parkdale Ave',
        serviceType: 'Seasonal Grounds Maintenance',
        priority: 'medium',
        status: 'onsite',
        notToExceed: 3200,
        createdDate: addDays(-2),
      },
      {
        id: 'WO-6631',
        location: '900 Morrison Dr',
        serviceType: 'Tree Removal',
        priority: 'high',
        status: 'pending',
        notToExceed: 4500,
        createdDate: addDays(-1),
      },
    ],
    invoices: [
      {
        id: 'INV-1-VID-1955',
        invoiceNumber: 'INV-2026-0089',
        workOrderId: 'WO-6598',
        invoiceDate: addDays(-25),
        amountBeforeTax: 3100,
        hst: 403,
        total: 3503,
        status: 'paid',
        notes: '',
        attachments: [{ fileName: 'INV-2026-0089.pdf', fileSize: 105000 }],
        submittedDate: addDays(-25),
      },
    ],
    accessRequests: [],
  };
}

const ACCOUNTS = [
  { id: 'VID-2847', name: 'ACME Cleaning Co.', email: 'accounts@acmecleaning.ca', initials: 'AC' },
  { id: 'VID-3102', name: 'Capital Elevator Services', email: 'ops@capitalelevator.ca', initials: 'CE' },
  { id: 'VID-1955', name: 'NorthStar Landscaping', email: 'billing@northstarlandscape.ca', initials: 'NL' },
];

async function main() {
  console.log('Seeding OCH vendor demo data...');

  // Clear in dependency order
  await prisma.invoiceAttachment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.complianceDoc.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.vendorUser.deleteMany();
  await prisma.vendor.deleteMany();

  for (const account of ACCOUNTS) {
    const data = seedVendorData(account.id);
    await prisma.vendor.create({
      data: {
        id: account.id,
        name: account.name,
        email: account.email,
        initials: account.initials,
        legalName: data.profile.legalName,
        phone: data.profile.phone,
        street: data.profile.street,
        city: data.profile.city,
        province: data.profile.province,
        postalCode: data.profile.postalCode,
        ownershipCategory: ownershipMap[data.profile.ownershipCategory] ?? OwnershipCategory.PREFER_NOT_TO_DISCLOSE,
        diversityNotes: data.profile.diversityNotes,
        paymentMethod: data.banking.paymentMethod,
        institutionNumber: data.banking.institutionNumber,
        transitNumber: data.banking.transitNumber,
        accountNumber: data.banking.accountNumber,
        pendingChangeRequested: data.banking.pendingChangeRequested,
        pendingChangeRequestedDate: data.banking.pendingChangeRequestedDate,
        documents: {
          create: data.documents.map((d) => ({
            id: d.id,
            name: d.name,
            type: d.type,
            uploadedDate: d.uploadedDate,
            expiryDate: d.expiryDate,
            fileName: d.fileName,
            fileSize: d.fileSize,
            required: d.required,
          })),
        },
        workOrders: {
          create: data.workOrders.map((w) => ({
            id: w.id,
            location: w.location,
            serviceType: w.serviceType,
            priority: w.priority,
            status: w.status,
            notToExceed: w.notToExceed,
            createdDate: w.createdDate,
          })),
        },
        invoices: {
          create: data.invoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            workOrderId: inv.workOrderId,
            invoiceDate: inv.invoiceDate,
            amountBeforeTax: inv.amountBeforeTax,
            hst: inv.hst,
            total: inv.total,
            status: inv.status,
            notes: inv.notes,
            submittedDate: inv.submittedDate,
            attachments: {
              create: inv.attachments.map((a) => ({
                fileName: a.fileName,
                fileSize: a.fileSize,
              })),
            },
          })),
        },
        accessRequests: {
          create: data.accessRequests.map((ar) => ({
            id: ar.id,
            requestedBy: ar.requestedBy,
            role: ar.role,
            status: ar.status,
            requestedDate: ar.requestedDate,
          })),
        },
      },
    });
    console.log(`  ✓ ${account.id} ${account.name}`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
