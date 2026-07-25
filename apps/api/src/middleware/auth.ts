import type { NextFunction, Request, Response } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { prisma } from '../lib/prisma.js';

export type AuthedRequest = Request & {
  authUser: {
    clerkUserId: string;
    vendorId: string;
    vendorUserId: string;
    email: string;
    name: string;
  };
};

function makeVendorId(): string {
  return `VID-${Math.floor(1000 + Math.random() * 9000)}`;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Requires a valid Clerk session and ensures a VendorUser (+ Vendor) exists.
 * On first login: attach to seeded vendor by email if present, else auto-create.
 */
export async function requireVendorAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let vendorUser = await prisma.vendorUser.findUnique({
      where: { clerkUserId: auth.userId },
    });

    if (!vendorUser) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const email =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        `${auth.userId}@users.clerk`;
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        clerkUser.username ||
        email;

      const existingVendor = await prisma.vendor.findUnique({ where: { email } });

      if (existingVendor) {
        vendorUser = await prisma.vendorUser.create({
          data: {
            clerkUserId: auth.userId,
            vendorId: existingVendor.id,
            role: 'admin',
            name,
            email,
          },
        });
      } else {
        const vendorId = makeVendorId();
        await prisma.vendor.create({
          data: {
            id: vendorId,
            name: name,
            email,
            legalName: name,
            phone: '',
            street: '',
            city: '',
            province: 'ON',
            postalCode: '',
            initials: initialsFromName(name),
            users: {
              create: {
                clerkUserId: auth.userId,
                role: 'admin',
                name,
                email,
              },
            },
          },
        });
        vendorUser = await prisma.vendorUser.findUniqueOrThrow({
          where: { clerkUserId: auth.userId },
        });
      }
    }

    (req as AuthedRequest).authUser = {
      clerkUserId: auth.userId,
      vendorId: vendorUser.vendorId,
      vendorUserId: vendorUser.id,
      email: vendorUser.email,
      name: vendorUser.name,
    };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function getAuthUser(req: Request) {
  return (req as AuthedRequest).authUser;
}
