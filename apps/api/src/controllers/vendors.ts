import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getAuthUser } from '../middleware/auth.js';
import {
  mapAccessRequest,
  mapDocument,
  mapInvoice,
  mapOwnershipFromUi,
  mapVendorProfile,
  mapWorkOrder,
} from '../lib/mappers.js';
import { updateVendorSchema } from '../schemas/index.js';

export async function getMe(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  res.json(mapVendorProfile(vendor));
}

export async function getVendorSummary(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const id = req.params.id;
  if (id !== vendorId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const [vendor, documents, workOrders, invoices, accessRequests] = await Promise.all([
    prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } }),
    prisma.complianceDoc.findMany({ where: { vendorId }, orderBy: { uploadedDate: 'desc' } }),
    prisma.workOrder.findMany({ where: { vendorId }, orderBy: { createdDate: 'desc' } }),
    prisma.invoice.findMany({
      where: { vendorId },
      include: { attachments: true },
      orderBy: { submittedDate: 'desc' },
    }),
    prisma.accessRequest.findMany({ where: { vendorId }, orderBy: { requestedDate: 'desc' } }),
  ]);

  res.json({
    ...mapVendorProfile(vendor),
    documents: documents.map(mapDocument),
    workOrders: workOrders.map(mapWorkOrder),
    invoices: invoices.map(mapInvoice),
    accessRequests: accessRequests.map(mapAccessRequest),
  });
}

export async function patchVendor(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const id = req.params.id;
  if (id !== vendorId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const parsed = updateVendorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      legalName: data.legalName,
      phone: data.phone,
      email: data.email,
      street: data.street,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      ownershipCategory: mapOwnershipFromUi(data.ownershipCategory),
      diversityNotes: data.diversityNotes ?? '',
    },
  });

  res.json(mapVendorProfile(vendor));
}
