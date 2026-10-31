import { Router } from 'express';
import { quotationTemplateController } from './quotation_template.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 8: Quotation templates
router.get('/', authorize('admin', 'staff'), (req, res, next) =>
  quotationTemplateController.list(req, res, next)
);

router.post('/', authorize('admin'), (req, res, next) =>
  quotationTemplateController.create(req, res, next)
);

router.get('/:id', authorize('admin', 'staff'), (req, res, next) =>
  quotationTemplateController.getById(req, res, next)
);

router.patch('/:id', authorize('admin'), (req, res, next) =>
  quotationTemplateController.update(req, res, next)
);

router.delete('/:id', authorize('admin'), (req, res, next) =>
  quotationTemplateController.delete(req, res, next)
);

export default router;
