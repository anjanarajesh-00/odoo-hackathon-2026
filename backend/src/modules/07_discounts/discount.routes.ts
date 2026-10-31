import { Router } from 'express';
import { discountController } from './discount.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 10: Discounts
router.get('/', authorize('admin', 'staff'), (req, res, next) =>
  discountController.list(req, res, next)
);

// Admin only as mandated in Contract v0.1: "Only admin can create discount rules (check the role in the API, not just the UI)"
router.post('/', authorize('admin'), (req, res, next) =>
  discountController.create(req, res, next)
);

router.patch('/:id', authorize('admin'), (req, res, next) =>
  discountController.update(req, res, next)
);

router.delete('/:id', authorize('admin'), (req, res, next) =>
  discountController.delete(req, res, next)
);

export default router;
