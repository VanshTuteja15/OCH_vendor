import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { apiRouter } from './routes/index.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'och-vendor-api' });
});

// Clerk keys are required for /api; keep /health usable before env is configured.
if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
  app.use('/api', clerkMiddleware(), apiRouter);
} else {
  console.warn(
    'CLERK_SECRET_KEY / CLERK_PUBLISHABLE_KEY missing — /api routes disabled until keys are set.'
  );
  app.use('/api', (_req, res) => {
    res.status(503).json({
      error: 'Auth not configured. Set CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY in apps/api/.env',
    });
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`OCH Vendor API listening on 0.0.0.0:${port}`);
});
