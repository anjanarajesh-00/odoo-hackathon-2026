import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 5: Customers (admin, staff)
router.get('/', authorize('admin', 'staff'), (req, res, next) =>
  userController.listCustomers(req, res, next)
);

router.post('/', authorize('admin', 'staff'), (req, res, next) =>
  userController.createCustomer(req, res, next)
);

router.get('/:id', authorize('admin', 'staff'), (req, res, next) =>
  userController.getCustomer(req, res, next)
);

router.patch('/:id', authorize('admin', 'staff'), (req, res, next) =>
  userController.updateCustomer(req, res, next)
);

export default router;
