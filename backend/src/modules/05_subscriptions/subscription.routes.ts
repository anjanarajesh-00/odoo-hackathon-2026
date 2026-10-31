import { Router } from 'express';
import { subscriptionController } from './subscription.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 11: Subscriptions
// List (admin, staff: all; customer: own only)
router.get('/', (req, res, next) => subscriptionController.list(req, res, next));

// Create (admin, staff)
router.post('/', authorize('admin', 'staff'), (req, res, next) =>
  subscriptionController.create(req, res, next)
);

// Detail (admin, staff, owning customer)
router.get('/:id', (req, res, next) => subscriptionController.getById(req, res, next));

// Edit while draft or quotation (admin, staff)
router.patch('/:id', authorize('admin', 'staff'), (req, res, next) =>
  subscriptionController.update(req, res, next)
);

// Move status (admin, staff)
router.post('/:id/transition', authorize('admin', 'staff'), (req, res, next) =>
  subscriptionController.transition(req, res, next)
);

// Renew an active subscription (admin, staff)
router.post('/:id/renew', authorize('admin', 'staff'), (req, res, next) =>
  subscriptionController.renew(req, res, next)
);

// Status change log (admin, staff)
router.get('/:id/history', authorize('admin', 'staff'), (req, res, next) =>
  subscriptionController.getHistory(req, res, next)
);

export default router;
