# OCH Vendor Portal — Working Prototype

A working, interactive prototype of the Ottawa Community Housing Vendor Portal, built with **React 18 + TypeScript + Vite + Tailwind CSS**.

## Demo accounts

| Vendor | Email | Password | MFA code |
|---|---|---|---|
| ACME Cleaning Co. | accounts@acmecleaning.ca | Acme2026! | 123456 |
| Capital Elevator Services | ops@capitalelevator.ca | Capital2026! | 123456 |
| NorthStar Landscaping | billing@northstarlandscape.ca | Northstar2026! | 123456 |

Wrong email/password/MFA code shows real inline validation errors. Once logged in, you can also switch between the three demo vendors instantly from the sidebar (click "Logged in as ...") without re-authenticating — handy for demoing different compliance/invoice states side by side.

## What's functional

- **Login** — real credential + 6-digit MFA validation against the demo accounts above.
- **Dashboard** — live stats (active work orders, pending invoice totals, paid-this-month, compliance score) computed from real app state.
- **Compliance Documents** — upload a real file (PDF/JPG/PNG); it's validated, added to the document list, and the compliance score / dashboard alerts update immediately. Expiry date determines status (Valid / Expiring Soon / Expired) automatically.
- **Invoices** — full 4-step submission wizard: select a work order → enter amount (HST auto-calculated at 13%) → upload a real supporting file → review → submit. Submission is blocked app-wide whenever a required compliance document is expired, matching the real business rule.
- **Company Profile** — edit and save company info; banking fields are locked and can only be changed via a "Request Banking Change" action that creates a pending-approval state (mirrors OCH's approval workflow).
- **Access Requests** — approve/deny team member access requests.
- **Work Orders** — full list view with the ability to jump straight into invoice submission for a given WO.

All data is held in the browser via `localStorage` (through Zustand's persist middleware), so it survives page reloads but is private to your browser/device — there's no real backend, authentication server, or database behind this. Uploaded files are validated and their name/size are stored and displayed; file *contents* are not persisted to a server (there isn't one) since this is a front-end-only prototype.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To produce a static production build:

```bash
npm run build
npm run preview
```

## Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Zustand (with localStorage persistence)
- Tailwind CSS
- lucide-react icons

## Known limitations (by design, as a prototype)

- No real backend, database, or auth provider — everything simulated client-side.
- MFA always accepts `123456`; there's no real authenticator integration.
- Uploaded file *content* isn't stored anywhere (no server) — only file metadata (name, size, type, dates).
- Banking change requests never get "approved" by anyone — there's no OCH-side reviewer view in this build.
