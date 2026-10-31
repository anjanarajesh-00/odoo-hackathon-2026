import { Router } from 'express';
import { reportingController } from './reporting.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 14: Dashboard and reports (admin, staff)
router.get('/summary', authorize('admin', 'staff'), (req, res, next) =>
  reportingController.getSummary(req, res, next)
);

router.get('/revenue-trend', authorize('admin', 'staff'), (req, res, next) =>
  reportingController.getRevenueTrend(req, res, next)
);

router.get('/subscriptions-by-status', authorize('admin', 'staff'), (req, res, next) =>
  reportingController.getSubscriptionsByStatus(req, res, next)
);

router.get('/overdue-invoices', authorize('admin', 'staff'), (req, res, next) =>
  reportingController.getOverdueInvoices(req, res, next)
);

router.get('/insights', authorize('admin', 'staff'), (req, res, next) =>
  reportingController.getInsights(req, res, next)
);

export default router;
