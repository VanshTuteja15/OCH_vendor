import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { getAuthUser } from '../middleware/auth.js';
import { mapWorkOrder } from '../lib/mappers.js';
import { createWorkOrderSchema, patchWorkOrderSchema } from '../schemas/index.js';

export async function listWorkOrders(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const workOrders = await prisma.workOrder.findMany({
    where: { vendorId },
    orderBy: { createdDate: 'desc' },
  });
  res.json(workOrders.map(mapWorkOrder));
}

export async function createWorkOrder(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const parsed = createWorkOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const wo = await prisma.workOrder.create({
    data: {
      vendorId,
      ...parsed.data,
      completedAt: parsed.data.status === 'completed' ? new Date() : null,
    },
  });
  res.status(201).json(mapWorkOrder(wo));
}

export async function patchWorkOrder(req: Request, res: Response) {
  const { vendorId } = getAuthUser(req);
  const id = String(req.params.id);
  const parsed = patchWorkOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.workOrder.findFirst({ where: { id, vendorId } });
  if (!existing) {
    res.status(404).json({ error: 'Work order not found' });
    return;
  }

  const wo = await prisma.workOrder.update({
    where: { id },
    data: {
      ...parsed.data,
      completedAt:
        parsed.data.status === 'completed'
          ? existing.completedAt ?? new Date()
          : parsed.data.status
            ? null
            : undefined,
    },
  });
  res.json(mapWorkOrder(wo));
}
