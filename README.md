# OCH Vendor Portal

Full-stack vendor portal monorepo for the Ottawa Community Housing RFI demo.

## Structure

```
apps/web   React + Vite + Tailwind + Clerk + TanStack Query
apps/api   Express + Prisma + Supabase Postgres + Clerk + Cloudinary
docs/      Build brief and notes
```

## Prerequisites

- Node.js 20+
- Supabase Postgres database (`DATABASE_URL` pooled + `DIRECT_URL` for migrations)
- Clerk application (`VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- Cloudinary account (`CLOUDINARY_URL`) — needed for file uploads

## Setup

```bash
npm install

# API env
cp apps/api/.env.example apps/api/.env
# Web env
cp apps/web/.env.example apps/web/.env
```

Fill in the env values, then:

```bash
# Generate Prisma client + run migrations + seed demo vendors
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed

# Dev servers
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:5173
```

### Demo seed tip

Create a Clerk user with email `accounts@acmecleaning.ca` (or the other seeded vendor emails). On first login the API attaches that user to the seeded vendor so the dashboard is populated.

## Deploy

- **Frontend:** Vercel — root/directory `apps/web`, set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL`
- **Backend:** Railway or Render — directory `apps/api`, set `DATABASE_URL`, `DIRECT_URL`, `CLERK_SECRET_KEY`, `CLOUDINARY_URL`, `CORS_ORIGIN`
- **Database:** Supabase Postgres
