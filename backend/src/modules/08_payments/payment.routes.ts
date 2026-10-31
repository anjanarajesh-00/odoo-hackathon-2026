import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 13: Payments
// List (admin, staff: all; customer: own only)
router.get('/', (req, res, next) => paymentController.list(req, res, next));

// Detail (admin, staff)
router.get('/:id', authorize('admin', 'staff'), (req, res, next) =>
  paymentController.getById(req, res, next)
);

export default router;
