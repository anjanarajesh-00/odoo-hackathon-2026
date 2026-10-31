import { Router } from 'express';
import { planController } from './plan.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 7: Plans
router.get('/', authorize('admin', 'staff'), (req, res, next) => planController.list(req, res, next));
router.post('/', authorize('admin'), (req, res, next) => planController.create(req, res, next));
router.get('/:id', authorize('admin', 'staff'), (req, res, next) => planController.getById(req, res, next));
router.patch('/:id', authorize('admin'), (req, res, next) => planController.update(req, res, next));

// Plan lifecycle operations
router.post('/:id/pause', authorize('admin'), (req, res, next) => planController.pause(req, res, next));
router.post('/:id/resume', authorize('admin'), (req, res, next) => planController.resume(req, res, next));
router.post('/:id/close', authorize('admin'), (req, res, next) => planController.close(req, res, next));
router.post('/:id/renew', authorize('admin'), (req, res, next) => planController.renew(req, res, next));

export default router;
