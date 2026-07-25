import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import { prisma } from '../src/lib/prisma.js';

const API = process.env.VITE_API_URL ?? 'http://localhost:4000';
const DEMO_EMAIL = 'accounts@acmecleaning.ca';
const DEMO_PASSWORD = 'AcmeDemo2026!';

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error('CLERK_SECRET_KEY missing');

  const clerk = createClerkClient({ secretKey });

  // Find or create demo user matching seeded ACME vendor email
  const existing = await clerk.users.getUserList({ emailAddress: [DEMO_EMAIL] });
  let user = existing.data[0];

  if (!user) {
    user = await clerk.users.createUser({
      emailAddress: [DEMO_EMAIL],
      password: DEMO_PASSWORD,
      firstName: 'ACME',
      lastName: 'Demo',
      skipPasswordChecks: true,
    });
    console.log('created_clerk_user', user.id);
  } else {
    console.log('found_clerk_user', user.id);
  }

  const session = await clerk.sessions.createSession({ userId: user.id });
  const tokenRes = await clerk.sessions.getToken(session.id);
  const token = typeof tokenRes === 'string' ? tokenRes : tokenRes?.jwt;
  if (!token) throw new Error('Failed to get session JWT');

  const meRes = await fetch(`${API}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meText = await meRes.text();
  console.log('me_status', meRes.status);
  if (!meRes.ok) throw new Error(`/api/me failed: ${meText}`);
  const me = JSON.parse(meText) as { vendorId: string; vendorName: string };
  console.log('me_vendor', me.vendorId, me.vendorName);

  const summaryRes = await fetch(`${API}/api/vendors/${me.vendorId}/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const summaryText = await summaryRes.text();
  console.log('summary_status', summaryRes.status);
  if (!summaryRes.ok) throw new Error(`/summary failed: ${summaryText}`);
  const summary = JSON.parse(summaryText) as {
    documents: unknown[];
    workOrders: unknown[];
    invoices: unknown[];
  };
  console.log(
    'summary_counts',
    `docs=${summary.documents.length}`,
    `wos=${summary.workOrders.length}`,
    `invoices=${summary.invoices.length}`
  );

  const vendorUser = await prisma.vendorUser.findUnique({
    where: { clerkUserId: user.id },
  });
  console.log(
    'db_vendor_user',
    vendorUser
      ? `ok vendorId=${vendorUser.vendorId} email=${vendorUser.email}`
      : 'MISSING'
  );

  if (me.vendorId !== 'VID-2847') {
    throw new Error(`Expected attachment to seeded ACME VID-2847, got ${me.vendorId}`);
  }
  if (summary.workOrders.length < 1 || summary.documents.length < 1) {
    throw new Error('Dashboard data not populated');
  }

  console.log('VERIFY_OK');
}

main()
  .catch((e) => {
    console.error('VERIFY_FAIL', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
