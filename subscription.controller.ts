import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from './subscription.service.js';
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  transitionSubscriptionSchema,
  renewSubscriptionSchema,
  subscriptionQuerySchema,
} from './subscription.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class SubscriptionController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = subscriptionQuerySchema.parse(req.query);
      const result = await subscriptionService.list(query, req.user!);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sub = await subscriptionService.getById(req.params.id, req.user!);
      sendSuccess(res, sub, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createSubscriptionSchema.parse(req.body);
      const sub = await subscriptionService.createSubscription(validated, req.user!);
      sendSuccess(res, sub, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateSubscriptionSchema.parse(req.body);
      const sub = await subscriptionService.updateSubscription(req.params.id, validated);
      sendSuccess(res, sub, 200);
    } catch (error) {
      next(error);
    }
  }

  async transition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = transitionSubscriptionSchema.parse(req.body);
      const sub = await subscriptionService.transition(req.params.id, validated, req.user!);
      sendSuccess(res, sub, 200);
    } catch (error) {
      next(error);
    }
  }

  async renew(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = renewSubscriptionSchema.parse(req.body);
      const sub = await subscriptionService.renew(req.params.id, validated, req.user!);
      sendSuccess(res, sub, 200);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await subscriptionService.getHistory(req.params.id);
      sendSuccess(res, history, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
