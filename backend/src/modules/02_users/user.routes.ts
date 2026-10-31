import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate, authorize } from '../01_auth/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Section 4: Users and staff
router.get('/', authorize('admin'), (req, res, next) => userController.listUsers(req, res, next));
router.post('/staff', authorize('admin'), (req, res, next) => userController.createStaff(req, res, next));
router.patch('/:id', authorize('admin'), (req, res, next) => userController.updateUser(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => userController.deactivateUser(req, res, next));

export default router;
