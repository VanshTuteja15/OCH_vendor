# OCH Vendor Portal — Full-Stack Build Brief

**Goal:** Convert the existing frontend-only mockup (`github.com/VanshTuteja15/OCH_vendor`) into a real, working full-stack site, ready to demo to OCH as part of the RFI showcase. No AI features yet — that's a later phase.

**Current state:** React 19 + Vite + TS + Tailwind + Zustand(persist). All "data" is hardcoded in `src/data/seed.ts` and lives in `localStorage`. Login is fake, MFA code is hardcoded `123456`.

**Target stack:**
- Frontend: React + TS + Vite + Tailwind + React Router + TanStack Query + React Hook Form + Zod
- Backend: Node.js + Express + TypeScript
- DB: **Supabase PostgreSQL** (Postgres host only — auth/storage still via Clerk + Cloudinary)
- ORM: Prisma
- Auth: **Clerk** (faster to ship, gives you real per-vendor accounts + a dashboard, and a native path to real MFA — which your mockup already fakes, so this is a direct upgrade)
- File storage: Cloudinary (compliance docs, invoice attachments)
- Deploy: Vercel (frontend) + Railway or Render (backend) + Supabase (DB)

---

## How to use this with Cursor

Don't paste this whole doc into Cursor at once. Work through the phases **in order**, one at a time, in your own chat with Cursor, and get each phase compiling/running before moving to the next. Each phase below ends with a ready-to-paste Cursor prompt.

---

## Phase 0 — Repo prep

1. Create a new folder structure: turn the existing repo into `apps/web` (your current Vite app), and add `apps/api` (new Express app) alongside it — or keep them as two separate repos if you'd rather deploy independently (simpler for Vercel + Railway). **Recommendation: two separate repos** — `och-vendor-web` and `och-vendor-api`. Cleaner deploys, less config.
2. Push what you have to `och-vendor-web` (rename current repo or keep as is).
3. Create a new empty repo `och-vendor-api`.

---

## Phase 1 — Database schema (Prisma + Supabase)

Map your current `src/types/index.ts` types directly into Prisma models. Based on the mockup's data shapes, you need roughly:

- `Vendor` — id, name, email, phone, address, status, createdAt
- `VendorUser` — id, vendorId (FK), clerkUserId, role, name, email
- `ComplianceDoc` — id, vendorId (FK), type, fileUrl (Cloudinary), status, expiresAt, uploadedAt
- `Invoice` — id, vendorId (FK), invoiceNumber, amount, status, dueDate, fileUrl, createdAt
- `WorkOrder` — id, vendorId (FK), title, description, status, priority, createdAt, completedAt
- `AccessRequest` — id, vendorId (FK), requestedBy, status, reason, createdAt

Go read `src/types/index.ts` and `src/data/seed.ts` in the current repo carefully before writing the schema — the mockup already tells you the exact shape each entity needs.

**Cursor prompt (paste into a fresh Cursor chat in `och-vendor-api`):**
```
Set up a new Node.js + Express + TypeScript backend from scratch.
Initialize with: express, @prisma/client, prisma (dev), typescript, ts-node-dev,
zod, cors, dotenv, @clerk/express.

Create a Prisma schema (schema.prisma) targeting PostgreSQL with these models:
Vendor, VendorUser, ComplianceDoc, Invoice, WorkOrder, AccessRequest.
[paste the field list from Phase 1 above, or better — paste the actual
contents of src/types/index.ts from the och-vendor-web repo here]

Set up the folder structure: src/routes, src/controllers, src/middleware,
src/lib/prisma.ts (Prisma client singleton).
Add a .env.example with DATABASE_URL, DIRECT_URL, and CLERK_SECRET_KEY placeholders.
Do not implement any routes yet — just schema, project structure, and
a working `npm run dev` that starts the server on port 4000.
```

Then: create a free Supabase project, copy the pooled connection string into `DATABASE_URL` and the direct connection string into `DIRECT_URL` in `.env`, run `npx prisma migrate dev --name init`.

---

## Phase 2 — Auth (Clerk)

1. Create a Clerk application (free tier is enough for a demo).
2. Frontend: install `@clerk/clerk-react`, wrap the app in `<ClerkProvider>`, replace the current fake `Login.tsx` flow with Clerk's `<SignIn />` component (or a custom form using Clerk's hooks if you want to keep the current UI look).
3. Backend: use `@clerk/express` middleware to verify the Clerk session JWT on every protected route.
4. Each Clerk user needs to map to a `VendorUser` row — on first login, create the `VendorUser` (and `Vendor` if needed) if it doesn't exist yet.

**Cursor prompt (web repo):**
```
Install @clerk/clerk-react. Wrap the app root in ClerkProvider using
VITE_CLERK_PUBLISHABLE_KEY from env. Replace src/pages/Login.tsx's fake
login/MFA flow with Clerk's SignIn component, keeping the existing page
layout/branding where possible. Update src/components/ProtectedRoute.tsx
to use Clerk's useAuth() instead of the current isAuthenticated check
from useAppStore.
```

---

## Phase 3 — Backend API routes

Build REST endpoints matching what each page currently needs from `useAppStore`:

| Page | Endpoints needed |
|---|---|
| Dashboard | `GET /api/vendors/:id/summary` |
| Work Orders | `GET/POST/PATCH /api/work-orders` |
| Invoices | `GET/POST /api/invoices` |
| Compliance Docs | `GET/POST /api/compliance-docs`, upload endpoint |
| Access Requests | `GET /api/access-requests`, `PATCH /api/access-requests/:id` |
| Profile | `GET/PATCH /api/vendors/:id` |

**Cursor prompt:**
```
Using the Prisma schema already in this project, build Express routes and
controllers for: Vendor, WorkOrder, Invoice, ComplianceDoc, AccessRequest.
Standard REST CRUD where it makes sense (see table below for which verbs
each resource needs). Protect all routes with the Clerk auth middleware
already set up. Every query must be scoped to the authenticated user's
vendorId — never return another vendor's data. Validate all request
bodies with zod schemas in src/schemas/.

[paste the endpoint table from Phase 3]
```

---

## Phase 4 — Wire the frontend to the real API

Replace every Zustand store action that currently mutates local state with a TanStack Query hook that calls the real API. Keep Zustand only for genuinely local UI state (toasts, sidebar open/closed) — not data.

**Cursor prompt:**
```
In src/store/useAppStore.ts, the app currently manages vendor data,
invoices, work orders, compliance docs, and access requests entirely
in local Zustand state with persist middleware. Replace this with
TanStack Query: create src/api/client.ts (axios or fetch wrapper that
attaches the Clerk session token), and src/api/hooks/ with useVendorData,
useInvoices, useWorkOrders, useComplianceDocs, useAccessRequests
(queries + mutations). Update each page in src/pages/ to use these
hooks instead of useAppStore for data. Keep useAppStore only for the
toast/UI state that's already there.
```

---

## Phase 5 — File uploads (Cloudinary)

Compliance docs and invoice attachments need real file storage.

**Cursor prompt (backend):**
```
Add Cloudinary upload support: an endpoint that accepts multipart
form-data (use multer), uploads to Cloudinary, and stores the resulting
secure_url on the relevant ComplianceDoc/Invoice record. Add
CLOUDINARY_URL to .env.example.
```

---

## Phase 6 — Deploy

1. **Supabase** — already live from Phase 1.
2. **Backend → Railway or Render** — connect the `och-vendor-api` repo, set env vars (`DATABASE_URL`, `DIRECT_URL`, `CLERK_SECRET_KEY`, `CLOUDINARY_URL`), Railway/Render auto-detects the Node build.
3. **Frontend → Vercel** — connect `och-vendor-web`, set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (pointing at your Railway/Render backend URL) as env vars.
4. Update CORS on the backend to allow your Vercel domain.

---

## Order of operations checklist

- [ ] Phase 0: split/prep repos
- [ ] Phase 1: Prisma schema + Supabase DB live, migrations run
- [ ] Phase 2: Clerk auth working on frontend + backend
- [ ] Phase 3: all API routes built and tested (Postman/Thunder Client)
- [ ] Phase 4: frontend fully switched from Zustand-mock to real API
- [ ] Phase 5: file uploads working
- [ ] Phase 6: deployed, working end-to-end on real URLs

Just create this file for now — don't start implementing anything yet.
I'm sending another message right after this with more instructions
before any coding begins.
