import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getAuthUser } from '../middleware/auth.js';
import { mapDocument } from '../lib/mappers.js';
import { createComplianceDocSchema } from '../schemas/index.js';

export async function listComplianceDocs(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const docs = await prisma.complianceDoc.findMany({
    where: { vendorId },
    orderBy: { uploadedDate: 'desc' },
  });
  res.json(docs.map(mapDocument));
}

export async function createComplianceDoc(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const parsed = createComplianceDocSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;

  if (data.replaceId) {
    const existing = await prisma.complianceDoc.findFirst({
      where: { id: data.replaceId, vendorId },
    });
    if (!existing) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    const updated = await prisma.complianceDoc.update({
      where: { id: data.replaceId },
      data: {
        name: data.name,
        type: data.type,
        expiryDate: new Date(data.expiryDate),
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl,
        uploadedDate: new Date(),
        required: data.required ?? true,
      },
    });
    res.json(mapDocument(updated));
    return;
  }

  // Upsert by type (same behavior as mock store)
  const sameType = await prisma.complianceDoc.findFirst({
    where: { vendorId, type: data.type },
  });

  if (sameType) {
    const updated = await prisma.complianceDoc.update({
      where: { id: sameType.id },
      data: {
        name: data.name,
        expiryDate: new Date(data.expiryDate),
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl,
        uploadedDate: new Date(),
        required: data.required ?? true,
      },
    });
    res.json(mapDocument(updated));
    return;
  }

  const created = await prisma.complianceDoc.create({
    data: {
      vendorId,
      name: data.name,
      type: data.type,
      expiryDate: new Date(data.expiryDate),
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileUrl: data.fileUrl,
      required: data.required ?? true,
    },
  });
  res.status(201).json(mapDocument(created));
}
