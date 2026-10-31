import { Router } from 'express';
import { invoiceController } from './invoice.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 12: Invoices
// List (admin, staff: all; customer: own only)
router.get('/', (req, res, next) => invoiceController.list(req, res, next));

// Bulk-generate all due invoices (billing day) (admin, staff)
router.post('/generate', authorize('admin', 'staff'), (req, res, next) =>
  invoiceController.generate(req, res, next)
);

// Manual invoice for one subscription (admin, staff)
router.post('/', authorize('admin', 'staff'), (req, res, next) =>
  invoiceController.create(req, res, next)
);

// Detail with lines and payments (admin, staff, owning customer)
router.get('/:id', (req, res, next) => invoiceController.getById(req, res, next));

// PDF download/view for printing (admin, staff, owning customer)
router.get('/:id/pdf', (req, res, next) => invoiceController.getPdf(req, res, next));

// Confirm draft to confirmed (admin, staff)
router.post('/:id/confirm', authorize('admin', 'staff'), (req, res, next) =>
  invoiceController.confirm(req, res, next)
);

// Cancel invoice (admin, staff)
router.post('/:id/cancel', authorize('admin', 'staff'), (req, res, next) =>
  invoiceController.cancel(req, res, next)
);

import { paymentController } from '../08_payments/payment.controller.js';

// Record payment against an invoice (admin, staff)
router.post('/:id/payments', authorize('admin', 'staff'), (req, res, next) =>
  paymentController.recordPayment(req, res, next)
);

export default router;
