import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.dto.js';
import { userRepository } from '../02_users/user.repository.js';
import { formatUserResponse } from '../02_users/user.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { sendSuccess } from '../../common/utils/response.js';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = signupSchema.parse(req.body);
      const result = await authService.signup(validated);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await authService.requestPasswordReset(validated.email);
      res.status(200).json({
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validated.token, validated.password);
      res.status(200).json({
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized('Not authenticated');
      }
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw AppError.notFound('User not found');
      }

      let customerId = req.user.customerId;
      if (!customerId && user.role === 'customer') {
        const c = await userRepository.findCustomerByUserId(user.id);
        customerId = c?.id;
      }

      sendSuccess(res, formatUserResponse(user, customerId));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
