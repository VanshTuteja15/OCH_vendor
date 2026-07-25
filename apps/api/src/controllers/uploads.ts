import type { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../lib/prisma.js';
import { getAuthUser } from '../middleware/auth.js';
import { mapDocument, mapInvoice } from '../lib/mappers.js';

function ensureCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL is not configured');
  }
}

async function uploadBuffer(buffer: Buffer, folder: string, filename: string) {
  ensureCloudinaryConfigured();
  return new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: filename.replace(/\.[^.]+$/, ''),
      },
      (err, result) => {
        if (err || !result) {
          reject(err ?? new Error('Upload failed'));
          return;
        }
        resolve({ secure_url: result.secure_url, bytes: result.bytes });
      }
    );
    stream.end(buffer);
  });
}

export async function uploadComplianceDoc(req: Request, res: Response) {
  try {
    const { vendorId } = getAuthUser(req);
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }

    const name = String(req.body.name ?? '');
    const type = String(req.body.type ?? '');
    const expiryDate = String(req.body.expiryDate ?? '');
    const replaceId = req.body.replaceId ? String(req.body.replaceId) : undefined;
    const required = req.body.required !== 'false';

    if (!name || !type || !expiryDate) {
      res.status(400).json({ error: 'name, type, and expiryDate are required' });
      return;
    }

    const uploaded = await uploadBuffer(file.buffer, `och-vendors/${vendorId}/compliance`, file.originalname);

    if (replaceId) {
      const existing = await prisma.complianceDoc.findFirst({
        where: { id: replaceId, vendorId },
      });
      if (!existing) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }
      const updated = await prisma.complianceDoc.update({
        where: { id: replaceId },
        data: {
          name,
          type,
          expiryDate: new Date(expiryDate),
          fileName: file.originalname,
          fileSize: uploaded.bytes || file.size,
          fileUrl: uploaded.secure_url,
          uploadedDate: new Date(),
          required,
        },
      });
      res.json(mapDocument(updated));
      return;
    }

    const sameType = await prisma.complianceDoc.findFirst({
      where: { vendorId, type },
    });

    if (sameType) {
      const updated = await prisma.complianceDoc.update({
        where: { id: sameType.id },
        data: {
          name,
          expiryDate: new Date(expiryDate),
          fileName: file.originalname,
          fileSize: uploaded.bytes || file.size,
          fileUrl: uploaded.secure_url,
          uploadedDate: new Date(),
          required,
        },
      });
      res.json(mapDocument(updated));
      return;
    }

    const created = await prisma.complianceDoc.create({
      data: {
        vendorId,
        name,
        type,
        expiryDate: new Date(expiryDate),
        fileName: file.originalname,
        fileSize: uploaded.bytes || file.size,
        fileUrl: uploaded.secure_url,
        required,
      },
    });
    res.status(201).json(mapDocument(created));
  } catch (err) {
    console.error('Compliance upload error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Upload failed',
    });
  }
}

export async function uploadInvoiceAttachment(req: Request, res: Response) {
  try {
    const { vendorId } = getAuthUser(req);
    const file = req.file;
    const invoiceId = String(req.params.id);

    if (!file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, vendorId },
    });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const uploaded = await uploadBuffer(file.buffer, `och-vendors/${vendorId}/invoices`, file.originalname);

    await prisma.invoiceAttachment.create({
      data: {
        invoiceId,
        fileName: file.originalname,
        fileSize: uploaded.bytes || file.size,
        fileUrl: uploaded.secure_url,
      },
    });

    const full = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { attachments: true },
    });
    res.status(201).json(mapInvoice(full));
  } catch (err) {
    console.error('Invoice upload error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Upload failed',
    });
  }
}
