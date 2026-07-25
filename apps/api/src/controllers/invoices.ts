import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getAuthUser } from '../middleware/auth.js';
import { mapInvoice } from '../lib/mappers.js';
import { createInvoiceSchema } from '../schemas/index.js';

export async function listInvoices(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const invoices = await prisma.invoice.findMany({
    where: { vendorId },
    include: { attachments: true },
    orderBy: { submittedDate: 'desc' },
  });
  res.json(invoices.map(mapInvoice));
}

export async function createInvoice(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const invoice = await prisma.invoice.create({
    data: {
      vendorId,
      invoiceNumber: data.invoiceNumber,
      workOrderId: data.workOrderId,
      invoiceDate: new Date(data.invoiceDate),
      amountBeforeTax: data.amountBeforeTax,
      hst: data.hst,
      total: data.total,
      notes: data.notes ?? '',
      attachments: {
        create: (data.attachments ?? []).map((a) => ({
          fileName: a.fileName,
          fileSize: a.fileSize,
          fileUrl: a.fileUrl,
        })),
      },
    },
    include: { attachments: true },
  });
  res.status(201).json(mapInvoice(invoice));
}
