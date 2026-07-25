import { z } from 'zod';

export const updateVendorSchema = z.object({
  legalName: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  street: z.string(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
  ownershipCategory: z.enum([
    'Prefer not to disclose',
    'Women-owned business',
    'Indigenous-owned business',
    'Minority-owned business',
  ]),
  diversityNotes: z.string().optional().default(''),
});

export const createWorkOrderSchema = z.object({
  location: z.string().min(1),
  serviceType: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['onsite', 'scheduled', 'pending', 'completed']).default('pending'),
  notToExceed: z.number().nonnegative(),
});

export const patchWorkOrderSchema = z.object({
  location: z.string().min(1).optional(),
  serviceType: z.string().min(1).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['onsite', 'scheduled', 'pending', 'completed']).optional(),
  notToExceed: z.number().nonnegative().optional(),
});

export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  workOrderId: z.string().min(1),
  invoiceDate: z.string().min(1),
  amountBeforeTax: z.number().nonnegative(),
  hst: z.number().nonnegative(),
  total: z.number().nonnegative(),
  notes: z.string().optional().default(''),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number().int().nonnegative(),
        fileUrl: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const createComplianceDocSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  expiryDate: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().nonnegative(),
  fileUrl: z.string().optional(),
  required: z.boolean().optional().default(true),
  replaceId: z.string().optional(),
});

export const patchAccessRequestSchema = z.object({
  status: z.enum(['approved', 'denied']),
});
