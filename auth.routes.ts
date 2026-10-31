import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from './auth.middleware.js';

const router = Router();

// Public auth endpoints matching Contract v0.1
router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Authenticated session route
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

export default router;
