import { Request, Response, NextFunction } from 'express';
import { planService } from './plan.service.js';
import {
  createPlanSchema,
  updatePlanSchema,
  renewPlanSchema,
  planQuerySchema,
} from './plan.dto.js';
import { sendSuccess, sendList } from '../../common/utils/response.js';

export class PlanController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = planQuerySchema.parse(req.query);
      const result = await planService.listPlans(query);
      sendList(res, result.data, result.total, result.page, result.pageSize);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await planService.getPlan(req.params.id);
      sendSuccess(res, plan, 200);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPlanSchema.parse(req.body);
      const plan = await planService.createPlan(validated);
      sendSuccess(res, plan, 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updatePlanSchema.parse(req.body);
      const plan = await planService.updatePlan(req.params.id, validated);
      sendSuccess(res, plan, 200);
    } catch (error) {
      next(error);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await planService.pausePlan(req.params.id);
      sendSuccess(res, plan, 200);
    } catch (error) {
      next(error);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await planService.resumePlan(req.params.id);
      sendSuccess(res, plan, 200);
    } catch (error) {
      next(error);
    }
  }

  async close(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await planService.closePlan(req.params.id);
      sendSuccess(res, plan, 200);
    } catch (error) {
      next(error);
    }
  }

  async renew(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = renewPlanSchema.parse(req.body);
      const plan = await planService.renewPlan(req.params.id, validated);
      sendSuccess(res, plan, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const planController = new PlanController();
