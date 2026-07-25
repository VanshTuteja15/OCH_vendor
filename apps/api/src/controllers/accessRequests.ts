import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getAuthUser } from '../middleware/auth.js';
import { mapAccessRequest } from '../lib/mappers.js';
import { patchAccessRequestSchema } from '../schemas/index.js';

export async function listAccessRequests(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const rows = await prisma.accessRequest.findMany({
    where: { vendorId },
    orderBy: { requestedDate: 'desc' },
  });
  res.json(rows.map(mapAccessRequest));
}

export async function patchAccessRequest(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const id = String(req.params.id);
  const parsed = patchAccessRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.accessRequest.findFirst({ where: { id, vendorId } });
  if (!existing) {
    res.status(404).json({ error: 'Access request not found' });
    return;
  }

  const updated = await prisma.accessRequest.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  res.json(mapAccessRequest(updated));
}
