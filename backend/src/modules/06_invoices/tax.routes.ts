import { Router } from 'express';
import { taxController } from './tax.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 9: Taxes
router.get('/', authorize('admin', 'staff'), (req, res, next) => taxController.list(req, res, next));
router.post('/', authorize('admin'), (req, res, next) => taxController.create(req, res, next));
router.patch('/:id', authorize('admin'), (req, res, next) => taxController.update(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => taxController.delete(req, res, next));

export default router;
