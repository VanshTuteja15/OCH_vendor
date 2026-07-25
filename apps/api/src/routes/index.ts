import { Router } from 'express';
import multer from 'multer';
import { requireVendorAuth } from '../middleware/auth.js';
import * as vendors from '../controllers/vendors.js';
import * as workOrders from '../controllers/workOrders.js';
import * as invoices from '../controllers/invoices.js';
import * as complianceDocs from '../controllers/complianceDocs.js';
import * as accessRequests from '../controllers/accessRequests.js';
import * as uploads from '../controllers/uploads.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const apiRouter = Router();

apiRouter.use(requireVendorAuth);

apiRouter.get('/me', vendors.getMe);
apiRouter.get('/vendors/:id/summary', vendors.getVendorSummary);
apiRouter.patch('/vendors/:id', vendors.patchVendor);

apiRouter.get('/work-orders', workOrders.listWorkOrders);
apiRouter.post('/work-orders', workOrders.createWorkOrder);
apiRouter.patch('/work-orders/:id', workOrders.patchWorkOrder);

apiRouter.get('/invoices', invoices.listInvoices);
apiRouter.post('/invoices', invoices.createInvoice);
apiRouter.post(
  '/invoices/:id/attachments',
  upload.single('file'),
  uploads.uploadInvoiceAttachment
);

apiRouter.get('/compliance-docs', complianceDocs.listComplianceDocs);
apiRouter.post('/compliance-docs', complianceDocs.createComplianceDoc);
apiRouter.post(
  '/compliance-docs/upload',
  upload.single('file'),
  uploads.uploadComplianceDoc
);

apiRouter.get('/access-requests', accessRequests.listAccessRequests);
apiRouter.patch('/access-requests/:id', accessRequests.patchAccessRequest);
