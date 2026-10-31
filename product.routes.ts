import { Router } from 'express';
import { productController } from './product.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 6: Products and variants
router.get('/', authorize('admin', 'staff'), (req, res, next) => productController.list(req, res, next));
router.post('/', authorize('admin'), (req, res, next) => productController.create(req, res, next));
router.get('/:id', authorize('admin', 'staff'), (req, res, next) => productController.getById(req, res, next));
router.patch('/:id', authorize('admin'), (req, res, next) => productController.update(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => productController.delete(req, res, next));

export default router;
