import { Router } from 'express';
import { portalController } from './portal.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Role customer only (admin and staff get 403)
router.get('/summary', authorize('customer'), (req, res, next) =>
  portalController.getSummary(req, res, next)
);

export default router;
